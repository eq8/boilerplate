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

var api = require('eq8-api')();
var Rx = require('rx');

var seneca = require('seneca')();
seneca.use(require('seneca-beanstalk-transport'));

var listen = seneca.listen({
	type: 'beanstalk',
	host: nconf.get('HOST_QUEUE')
});

api.on('search', listen.add.bind(listen));

api.on('state', function(ctxt, msg, done) {
	ctxt.trx
		.insert({
			desc: ctxt.name,
			msg: JSON.stringify(msg);
		})
		.into(nconf.get('logtable'))
		.asCallback(done);
});

api.addRegistrar({
	actions: function(actions, callback, prior) {
		prior(actions, function() {
			Rx.Observable.from(actions)
				.subscribe(
					function(action) {
						api.search(action.pattern, function(msg, done) {
							knex.transaction(function(trx) {
								api.state({name: action.name, trx: trx}, msg, function(err) {
									if(err) {
										return trx.rollback();
									}

									return trx.commit();
								});
							});
						})
					},
					callback,
					callback
				);
		});
	}
});
