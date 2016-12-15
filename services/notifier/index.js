'use strict';

var nconf = require('nconf');
nconf
	.argv()
	.env()
	.file({file: './defaults.json'});

var seneca = require('seneca')();
seneca.use(require('seneca-redis-transport'));

var listen = seneca.listen({
	port: nconf.get('listenPort')
});

var client = seneca.client({
	type: 'redis',
	host: nconf.get('pubsubHost')
});

listen.add({to: 'notifier'}, function(msg, done) {
	client.act(msg.body, done);
});
