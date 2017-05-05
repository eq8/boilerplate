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
		done(null, {error: err});
	};

	knex
		.transaction(function(trx) {
			return Rx.Observable
				.of(msg.body)
				.concatMap(body => {
					return Rx.Observable.fromArray(body.items);
				})
				.concatMap(function(item) {
					var insert = trx
						.insert({
							type: item.type,
							id: item.id,
							version: item.version
						})
						.into('version');

					return Rx.Observable.fromNodeCallback(insert.asCallback, insert)();
				})
				.toPromise();
		})
		.then(function() {
			client.act({to: 'broadcast', items: msg.body.items}, callback);
		})
		.catch(callback);
});
