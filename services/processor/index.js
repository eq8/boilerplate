'use strict';

var nconf = require('nconf');
nconf
	.argv()
	.env()
	.file({file: './defaults.json'});

var knex = require('knex')({
	client: 'mysql',
	connection: {
		host : nconf.get('DB_HOST'),
		user: nconf.get('DB_USER'),
		database : nconf.get('db')
	}
});

var api = require('eq8-api')();
var Rx = require('rx');

var seneca = require('seneca')();
seneca.use(require('seneca-beanstalk-transport'));

var listen = seneca.listen({
	type: 'beanstalk',
	host: nconf.get('QUEUE_HOST')
});

api.on('subscribe', listen.add.bind(listen));

api.addRegistrar({
	actions: function(actions, callback, prior) {
		// TODO: var done = _.once(callback);
		prior(actions, function() {
			Rx.Observable.from(actions)
				.subscribe(
					function(action) {
						api.subscribe(action.pattern, function(msg, done) {
							knex.transaction(function(trx) {
								var statement = trx
									.insert({
										description: action.name,
										message: JSON.stringify(msg)
									})
									.into(nconf.get('log'));

								api.logger.trace('statement:', statement.toString());
								//statement.asCallback();

								api.state({trx: trx}, msg, function(err) {
									if(err) {
										trx.rollback();
									} else {
										trx.commit();
									}

									setImmediate(done, err);
								});
							});
						});
					},
					callback,
					callback
				);
		});
	}
});

var http = require('http');
var connect = require('connect');
var RED = require('node-red');

// Create an Express app
var app = connect();

// Create a server
var server = http.createServer(app);

// Create the settings object - see default settings.js file for other options
var settings = {
	httpAdminRoot:'/admin',
	httpNodeRoot: '/admin/api',
	logging: nconf.get('LOG_LEVEL'),
	functionGlobalContext: { }    // enables global context
};

// Initialise the runtime with a server and settings
RED.init(server,settings);

// Serve the editor UI from /red
app.use(settings.httpAdminRoot, RED.httpAdmin);

// Serve the http nodes UI from /api
app.use(settings.httpNodeRoot, RED.httpNode);

server.listen(nconf.get('port'));

// Start the runtime
RED.start();
