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
		async: function asyncHandler(ws, next) {
			var self = this;

			ws.on('message', function messageHandler(message) {
				var e;
				try {
					e = JSON.parse(message);
					e.user = ws.user;
					e.view = ws.route;
				} catch (ex) {
					self.logger.error('WebSocket message was not in JSON', message);
					ws.send(JSON.stringify({error: {status: '400', title: 'bad-request'}}));
				}

				if(e) {
					self.trigger(e);
				}
			})
		}
	}
});

var seneca = require('seneca')();
seneca.use(require('seneca-beanstalk-transport'));
var client = seneca.client({
	type: 'beanstalk',
	host: nconf.get('HOST_QUEUE')
});
api.on('trigger', client.act.bind(client));

var app = express();

app.use(express.static(nconf.get('public')));

app.use('/api', api.syncware);

api.emit('listening', app.listen(nconf.get('port')));
