'use strict';

var nconf = require('nconf');
nconf
	.argv()
	.env()
	.file({file: './defaults.json'});

var api = require('eq8-api')();

var seneca = require('seneca')();
seneca.use(require('seneca-redis-transport'));

var client = seneca.client({
	type: 'redis',
	host: nconf.get('PUBSUB_HOST')
});

api.on('dispatch', function() {
	this.logger.trace('dispatch:', arguments);
	client.act.apply(client, arguments);
});
