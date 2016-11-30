'use strict';

var nconf = require('nconf');
nconf
	.argv()
	.env()
	.file({file: './defaults.json'});

var api = require('eq8-api')();

var seneca = require('seneca')();
seneca.use(require('seneca-redis-transport'));

var listen = seneca.listen({
	type: 'redis',
	host: nconf.get('PUBSUB_HOST')
});

api.on('subscribe', function() {
	this.logger.trace('dispatch:', arguments);
	listen.add.apply(listen, arguments);
});
