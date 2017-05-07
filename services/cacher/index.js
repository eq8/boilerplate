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
	pin: 'to:broadcast'
});

var Rx = require('rx');
var _ = require('lodash');
var redis = require('redis');
var client = redis.createClient(nconf.get('cachePort'), nconf.get('cacheHost'));
var cacheKey = nconf.get('cacheKey');

listen.add({to: 'broadcast'}, function(msg, done) {
	var callback = err => {
		done(null, {error: err});
	};

	Rx.Observable
		.from(msg.payload)
		.map(obj => {
			return obj[cacheKey];
		})
		.reduce((acc, cacheObj) => {
			if(_.has(cacheObj, 'schemaVersion')) {
				switch(cacheObj.schemaVersion) {
				case '0.1':
				default:
					acc = _.concat(acc, cacheObj.bulk);
					break;
				}
			}
			return acc;
		}, [])
		.concatMap(bulk => {
			return Rx.Observable.from(bulk);
		})
		.reduce((multi, cmd) => {
			return multi[cmd.key](cmd.args);
		}, client.multi())
		.subscribeOnNext(multi => {
			multi.exec(callback);
		});
});
