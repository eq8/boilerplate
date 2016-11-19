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

var seneca = require('seneca')();
seneca.use(require('seneca-beanstalk-transport'));

var listen = seneca.listen({
	type: 'beanstalk',
	host: nconf.get('QUEUE_HOST')
});

listen.add({source: 'queue'}, function(msg, done) {
	knex.transaction(function(trx) {
		api.state({trx: trx, user: msg.user}, msg.body, function(err) {
			done(JSON.stringify(err));

			if(err) {
				return trx.rollback();
			}
			
			return trx.commit();
		});
	});
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
	nodesDir: '/src/nodes',
	api: api
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
