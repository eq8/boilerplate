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

var transport = require('seneca')();
transport.use(require('seneca-amqp-transport'));

transport.listen({
	type: 'amqp',
	host: nconf.get('queueUrl'),
	pin: 'to:vcs'
});

/*
var client = transport.client({
	type: 'redis',
	host: nconf.get('pubsubHost'),
	port: nconf.get('pubsubPort')
});
*/

var Rx = require('rx');
var _ = require('lodash');

transport.add({to: 'vcs'}, function(msg, done) {
	var callback = _.once(_.ary(done, 0));

	knex.transaction(function(trx) {
		return Rx.Observable
			.fromArray(msg.items)
			.concatMap(function(item) {
				var insert = trx.insert({
					type: item._type,
					id: item._id,
					version: item._version
				})
					.into('version');

				return Rx.Observable.fromNodeCallback(insert.asCallback, insert)();
			})
			.toPromise();
	})
	.then(callback)
	.catch(callback);
});
