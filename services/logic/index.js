'use strict';

var nconf = require('nconf');
nconf
	.argv()
	.file({file: './defaults.json'});

var api = require('eq8-api')();

var seneca = require('seneca')();
seneca.use(require('seneca-amqp-transport'));

var client = seneca.client({
	type: 'amqp',
	host: nconf.get('queueUrl'),
	pin: 'to:vcs'
});

api.on('dispatch', function() {
	this.logger.trace('dispatch', arguments);
	client.act.apply(client, arguments);
});

var http = require('http');
var connect = require('connect');
var RED = require('node-red');

var app = connect();
var bodyParser = require('body-parser');
var server = http.createServer(app);

// Create the settings object - see default settings.js file for other options
var settings = {
	httpAdminRoot:'/admin',
	nodesDir: '/src/nodes',
	api: api
};

// Initialise the runtime with a server and settings
RED.init(server, settings);

app.use(nconf.get('apiRoot'), bodyParser.json());

// Serve the editor UI from /admin
app.use(settings.httpAdminRoot, RED.httpAdmin);

app.use(nconf.get('apiRoot') + '/actions', function(req, res) {
	api.state({}, req.body);
	res.json({ok: true});
	res.end();
});

server.listen(nconf.get('port'));

// Start the runtime
RED.start();
