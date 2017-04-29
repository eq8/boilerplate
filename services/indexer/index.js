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
var elasticsearch = require('elasticsearch')
var hostString = nconf.get('indexHost') + ':' + nconf.get('indexPort');
var client = new elasticsearch.Client({
	host: hostString
});
var indexKey = nconf.get('indexKey');

listen.add({to: 'broadcast'}, function(msg, done) {
	Rx.Observable
		.from(msg.items)
		.map(item => {
			return item[indexKey]
		})
		.reduce((item, currentValue) => {
			if(_.has(item, 'schemaVersion')) {
				switch(item.schemaVersion) {
					case '0.1':
					default:
						currentValue = _.concat(currentValue, item.bulkItems)
						break;
				}
			}
			return currentValue;
		}, [])
		.concatMap(bulkItems => {
			return Rx.Observable
				.fromNodeCallback(client.bulk, client)(bulkItems);
		})
		.subscribeOnError(err => {
			done(err);
		})
		.subscribeOnCompleted(() => {
			done();
		});
});
