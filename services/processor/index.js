'use strict';

var nconf = require('nconf');
nconf
	.argv()
	.env()
	.file({file: './defaults.json'});

var api = require('eq8-api')();

var seneca = require('seneca')();
seneca.use(require('seneca-beanstalk-transport'));

var listen = seneca.listen({
	type: 'beanstalk',
	host: nconf.get('QUEUE_HOST')
});

api.on('subscribe', function() {
	this.logger.trace('dispatch:', arguments);
	listen.add.apply(listen, arguments);
});

api.subscribe({to: 'queue'}, function(msg, done) {
	api.state({user: msg.user}, msg.body, function(err) {
		done(err ? JSON.stringify(err) : null);
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
	nodesDir: '/src/nodes',
	api: api
};

// Initialise the runtime with a server and settings
RED.init(server,settings);

// Serve the editor UI from /admin
app.use(settings.httpAdminRoot, RED.httpAdmin);

server.listen(nconf.get('port'));

// Start the runtime
RED.start();
