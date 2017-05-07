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

	var observable = Rx.Observable
		.from(msg.payload)
		.map(obj => {
			return obj[indexKey];
		});

	observable
		.reduce((acc, indexObj) => {
			if(_.has(indexObj, 'schemaVersion')) {
				switch(indexObj.schemaVersion) {
				case '0.1':
				default:
					acc = _.concat(acc, indexObj.bulk);
					break;
				}
			}
			return acc;
		}, [])
		.subscribeOnNext(bulk => {
			client.bulk({body: bulk}, callback);
		});

	observable
		.concatMap(indexObj => {
			var cmds = [];

			if(_.has(indexObj, 'schemaVersion')) {
				switch(indexObj.schemaVersion) {
				case '0.1':
				default:
					cmds = Rx.Observable.from(indexObj.indices);
					break;
				}
			}

			return cmds;
		})
		.subscribeOnNext(cmd => {
			client.indices[cmd.key].apply(client.indices, cmd.args);
		});
});
