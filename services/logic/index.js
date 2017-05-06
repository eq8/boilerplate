'use strict';

var nconf = require('nconf');
nconf
	.argv()
	.file({file: './defaults.json'});

// initialize settings object for node-red
var settings = {
	httpNodeRoot: nconf.get('apiRoot'),
	httpAdminRoot: nconf.get('adminRoot'),
	nodesDir: '/src/nodes'
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

// include body-parser middleware for parsing the body for the apiRoot
var bodyParser = require('body-parser');
var apiBodyParser = nconf.get('apiBody:parser');
var apiBodyOptions = nconf.get('apiBody:options');
app.use(nconf.get('apiRoot'), bodyParser[apiBodyParser](apiBodyOptions));

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
app.use(settings.httpNodeRoot, RED.httpNode);

server.listen(nconf.get('port'));

// Start the runtime
RED.start();
