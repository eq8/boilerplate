'use strict';

var nconf = require('nconf');
nconf
	.argv()
	.file({file: './defaults.json'});

// create and initialize an eq8-api object to be passed as a context for node-red
var api = require('eq8-api')();

// create a seneca transport client to the version control service (VCS) via rabbitmq
var seneca = require('seneca')();
seneca.use(require('seneca-amqp-transport'));

var client = seneca.client({
	type: 'amqp',
	host: nconf.get('queueUrl'),
	pin: 'to:vcs'
});

// when a node-red message is routed to an eq8 output node, it triggers a `dispatch` event
// we listen to that dispatch event and forward it to the seneca transport client
api.on('dispatch', function() {
	this.logger.trace('dispatch', arguments);
	client.act.apply(client, arguments);
});

// initialize settings object for node-red
var settings = {
	httpAdminRoot: nconf.get('adminRoot'),
	nodesDir: '/src/nodes',
	api: api
};

// initialize server to be used with node-red
var express = require('express');
var app = express();
var http = require('http');
var server = http.createServer(app);

var RED = require('node-red');
RED.init(server, settings);

// use JWT strategy for authentication
var passport = require('passport');
var AnonymousStrategy = require('passport-anonymous').Strategy;
var JwtStrategy = require('passport-jwt').Strategy;
var ExtractJwt = require('passport-jwt').ExtractJwt;

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

// also allow anonymous user
passport.use(new AnonymousStrategy());

app.use(passport.initialize());

app.use(function initAnonymousUser(req, res, next) {
	if (!req.user) {
		req.user = nconf.get('jwt:users:anon');
	}

	next();
});

// include body-parser middleware for parsing json for the apiRoot
var bodyParser = require('body-parser');
app.use(nconf.get('apiRoot'), bodyParser.json());

// throw an error 500 if json was invalid
app.use(function(error, req, res, next) {
	if(error) {
		res.status(500).end();
	} else {
		next();
	}
});

// create node-red admin route
app.use(settings.httpAdminRoot, RED.httpAdmin);

// map GET /<apiRoot> requests to api.express calls
app.get(nconf.get('apiRoot'), function(req, res) {
	api.express({user: req.user}, req.query, function done(err, result) {
		if (err) {
			res.status(500);
		}

		if(result) {
			res.json(result);
		}

		res.end();
	});
});

// map GET /<apiRoot> requests to api.state calls
app.post(nconf.get('apiRoot'), function(req, res) {
	api.state({user: req.user}, req.body);
	res.end();
});

server.listen(nconf.get('port'));

// Start the runtime
RED.start();
