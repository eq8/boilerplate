'use strict';

var nconf = require('nconf');
nconf
	.argv()
	.file({file: './defaults.json'});

var knex = require('knex')({
	client: 'mysql',
	connection: {
		database: nconf.get('dbName'),
		host: nconf.get('dbHost'),
		port: nconf.get('dbPort'),
		user: nconf.get('dbUser'),
		password: nconf.get('dbPassword')
	}
});

// TODO: add defaults for migration config
knex.migrate.latest();

var transport = require('seneca')();
transport.use(require('seneca-amqp-transport'));
transport.use(require('seneca-redis-transport'));

var listen = transport.listen({
	type: 'amqp',
	host: nconf.get('queueUrl'),
	pin: 'to:vcs'
});

var client = transport.client({
	type: 'redis',
	host: nconf.get('pubsubHost'),
	port: nconf.get('pubsubPort'),
	pin: 'to:broadcast'
});

var Rx = require('rx');

listen.add({to: 'vcs'}, function(msg, done) {
	// map error as a result to prevent seneca fatal error
	var callback = function(err) {
		done(null, {ok: !err, error: err});
	};

	knex
		.transaction(function(trx) {
			return Rx.Observable
				.of(msg.body)
				.concatMap(body => {
					return Rx.Observable.fromArray(body.payload);
				})
				.concatMap(function(obj) {
					var insert = trx
						.insert({
							type: obj.type,
							id: obj.id,
							version: obj.version
						})
						.into('version');

					return Rx.Observable.fromNodeCallback(insert.asCallback, insert)();
				})
				.toPromise();
		})
		.then(function() {
			client.act({to: 'broadcast', payload: msg.body.payload}, callback);
		})
		.catch(callback);
});
