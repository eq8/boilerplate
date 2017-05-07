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
var elasticsearch = require('elasticsearch');
var hostString = nconf.get('indexHost') + ':' + nconf.get('indexPort');
var client = new elasticsearch.Client({
	host: hostString
});
var indexKey = nconf.get('indexKey');

listen.add({to: 'broadcast'}, function(msg, done) {
	var callback = err => {
		done(null, {error: err});
	};

	Rx.Observable
		.from(msg.payload)
		.map(obj => {
			return obj[indexKey];
		})
		.reduce((obj, currentValue) => {
			if(_.has(obj, 'schemaVersion')) {
				switch(obj.schemaVersion) {
				case '0.1':
				default:
					currentValue = _.concat(currentValue, obj.bulk);
					break;
				}
			}
			return currentValue;
		}, [])
		.subscribeOnNext(bulk => {
			client.bulk({body: bulk}, callback);
		});
});
