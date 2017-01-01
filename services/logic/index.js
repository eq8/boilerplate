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

var passport = require('passport');
var AnonymousStrategy = require('passport-anonymous').Strategy;
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;

// Create the settings object - see default settings.js file for other options
var settings = {
	httpAdminRoot:'/admin',
	nodesDir: '/src/nodes',
	api: api
};

// Initialise the runtime with a server and settings
RED.init(server, settings);

var passportJwtOptions = {
	secretOrKey: nconf.get('jwt:secret'),
	jwtFromRequest: ExtractJwt.fromAuthHeader(),
	algorithms: nconf.get('jwt:verify:algorithms'),
	issuer: nconf.get('jwt:verify:issuer'),
	audience: nconf.get('jwt:verify:audience'),
	ignoreExpiration: nconf.get('jwt:verify:ignoreExpiration')
};

passport.use(new JwtStrategy(passportJwtOptions, function(payload, done) {
	done(null, payload);
}));
passport.use(new AnonymousStrategy());

app.use(passport.initialize());

app.use(function initAnonymousUser(req, res, next) {
	if (!req.user) {
		req.user = nconf.get('jwt:users:anon');
	}

	next();
});

app.use(nconf.get('apiRoot'), bodyParser.json());

app.use(settings.httpAdminRoot, RED.httpAdmin);

app.use(nconf.get('apiRoot') + '/actions', function(req, res, next) {
	api.state({user: req.user}, req.body);
	next();
});

app.use(function(error, req, res, next) {
	if(error) {
		res.statusCode = 500;
		res.end();
	} else {
		next();
	}
});

server.listen(nconf.get('port'));

// Start the runtime
RED.start();
