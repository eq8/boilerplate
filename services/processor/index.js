'use strict';

var nconf = require('nconf');
nconf
	.argv()
	.env()
	.file({file: './defaults.json'});

var knex = require('knex')(
	client: 'mysql',
	connection: {
		host : nconf.get('HOST_DB'),
		database : nconf.get('db')
	}
);

var api = require('eq8-api')({
	registrars: {
		actions: function(actions, callback) {
			Rx.Observable.from(actions)
				.subscribe(
					function(action) {
						api.search(action, function(args, done) {
							knex.transaction(function(trx) {
								api.state({
									trx: trx
								}, args, done);
							});
						})
					},
					callback,
					callback
				);
		}
	}
});
var Rx = require('rx');

var seneca = require('seneca')();
seneca.use(require('seneca-beanstalk-transport'));
var listen = seneca.listen({
	type: 'beanstalk',
	host: nconf.get('HOST_QUEUE')
});
api.on('search', listen.add.bind(listen));

api.addRegistrar({
})
