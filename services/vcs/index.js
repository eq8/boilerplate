'use strict';

var nconf = require('nconf');
nconf
	.argv()
	.file({file: './defaults.json'});

var knex = require('knex')({
	client: 'mysql',
	connection: {
		database: nconf.get('db'),
		host: nconf.get('dbHost'),
		port: nconf.get('dbPort'),
		user: nconf.get('dbUser'),
		password: nconf.get('dbPassword')
	}
});

// TODO: add defaults for migration config
knex.migrate.latest();

var api = require('eq8-api')();
var seneca = require('seneca')();

var listen = seneca.listen({
	port: nconf.get('listenPort')
});

api.on('subscribe', function() {
	this.logger.trace('subscribe:', arguments);
	listen.add.apply(listen, arguments);
});

api.subscribe({to: 'vcs'}, function(msg, done) {
	knex.transaction(function(trx) {
		var commit = {
			ns: 'vcs',
			cmd: 'commit',
			type: 'transaction',
			body: msg.body
		};
		api.state({trx: trx}, commit, function(err) {
			if(err) {
				trx.rollback();
				// TODO: queue an action to notify user that the recent action failed
			} else {
				trx.commit();
			}
		});
	}).asCallback(done);
});

var client = seneca.client({
	host: nconf.get('clientHost'),
	port: nconf.get('clientPort')
});

api.on('dispatch', function() {
	this.logger.trace('dispatch:', arguments);
	client.act.apply(client, arguments);
});

var Rx = require('rx');
var _ = require('lodash');

api.register({
	actions: [
		{
			name: 'commit',
			pattern: {ns: 'vcs', cmd: 'commit', type: 'transaction'},
			handler: function(ctxt, args, done) {
				var api = this;
				var callback = _.once(done);

				Rx.Observable
					.fromArray(Object.keys(args))
					.concatMap(function(type) {
						return Rx.Observable
							.fromArray(Object.keys(args.object[type]))
							.concatMap(function(id) {
								return Rx.Observable
									.fromNodeCallback(api.state, api)(
										ctxt, {
											ns: 'vcs', cmd: 'denormalize',
											type: type,
											id: id,
											object: args.object[type][id]
										}
									);
							});
					})
					.reduce(function(denormalized, entity) {
						return _.merge({}, denormalized, entity);
					}, {})
					.subscribeOnNext(function(denormalized) {
						api.dispatch({
							to: 'notifier',
							body: denormalized
						}, callback);
					})
					.subscribeOnError(callback);
			}
		}
	]
});

/*
TODO:
create registrar for values
- it should register some new views (eq8-api) which in turn registers new query types in graphql (eq8)
- it should register commit actions for the value
create registrar for entities
- sample params: namespace, entity, version
- it should register commit actions for the entity
create an action to register entities via messages
register value types
install seneca-knex-store
implement queries in seneca-knex-store using registered value types
*/

/*
downstream message schema
{
	vcs: {
		entity(uuid???): {
			id: uuid,
			version: bigInteger
			attribute: value
		}
	},
	index: {
		entity(uuid???): {
			mapping: {},
			insertSource: {
				locale: {
				}
			}
			previousVersions: [
				{schemaVersion, locale, entity, id}
			]
		}
	}
}
*/
