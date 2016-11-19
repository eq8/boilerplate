'use strict';

var nconf = require('nconf');
nconf
	.argv()
	.env()
	.file({file: './defaults.json'});

var express = require('express');

// TODO: add nconf for other JWT options
var api = require('eq8')({
	jwt: {secret: nconf.get('secret')},
	handlers: {
		async: function asyncHandler(ws) {
			var self = this;

			ws.on('message', function messageHandler(message) {
				var msg = {};
				try {
					msg.source = 'queue';
					msg.body = JSON.parse(message);
					msg.user = ws.user;
				} catch (ex) {
					self.logger.error('WebSocket message was not in JSON', message);
					ws.send(JSON.stringify({error: {status: '400', title: 'bad-request'}}));
				}

				if(msg.body) {
					self.dispatch(msg, function(err) {
						if(err) {
							ws.send({error: err});
						}
					});
				}
			});
		}
	}
});

var seneca = require('seneca')();
seneca.use(require('seneca-beanstalk-transport'));
var client = seneca.client({
	type: 'beanstalk',
	host: nconf.get('QUEUE_HOST')
});

api.on('dispatch', function() {
	this.logger.trace('dispatch:', arguments);
	client.act.apply(client, arguments);
});

var app = express();

app.use(express.static(nconf.get('public')));

app.use('/api', api.syncware);

api.chainListener('request', function(req, res) {
	app(req, res);
});

api.listen(nconf.get('port'));
