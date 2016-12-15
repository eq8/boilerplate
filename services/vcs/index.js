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
transport.use(require('seneca-redis-transport'));

var client = transport.client({
	type: 'redis',
	host: nconf.get('pubsubHost'),
	port: nconf.get('pubsubPort')
});

var listen = transport.listen({
	port: nconf.get('listenPort')
});

var Rx = require('rx');
var _ = require('lodash');

listen.add({to: 'vcs'}, function(msg, done) {
	var callback = _.once(done);

	knex.transaction(function(trx) {
		Rx.Observable
			.fromArray(msg.items)
			.concatMap(function(item) {
				var insert = ctx.trx
				insert({
					type: item._type,
					id: item._id,
					version: item._version
				})
				.into('version');

				return Rx.Observable
					.fromNodeCallback(insert.asCallback, insert);
			})
			.subscribeOnError(callback)
			.subscribeOnComplete(callback);
	}).asCallback(function(err) {
		if(err) return done(err);

		client.act({to: 'all', items: msg.items}, done);
	});
});
