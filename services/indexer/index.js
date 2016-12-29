'use strict';

var nconf = require('nconf');
nconf
	.argv()
	.file({file: './defaults.json'});

var transport = require('seneca')();
transport.use(require('seneca-redis-transport'));

var listen = transport.listen({
	type: 'redis',
	host: nconf.get('pubsubHost'),
	port: nconf.get('pubsubPort'),
	pin: 'to:indexer'
});

/*
var Rx = require('rx');
var _ = require('lodash');
*/

listen.add({to: 'indexer'}, function(msg, done) {
	console.log('msg:', msg);
	done();
});
