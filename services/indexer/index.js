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

var async = require('async');
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
		done(null, {from: 'indexer', payload: {ok: !err, error: err}});
	};

	if(!_.has(msg, 'payload.'+indexKey)) {
		return callback();
	}

	var payload = Rx.Observable
		.from(msg.payload)
		.map(obj => {
			return obj[indexKey];
		})
		.where(indexObj => !_.isEmpty(indexObj));

	async.parallel([
		done => {
			var cb = _.once(done);
			var obs = payload
				.where(indexObj => _.isArray(indexObj.bulk))
				.map(indexObj => {
					return indexObj.bulk;
				})
				.concatMap(bulk => {
					return Rx.Observable
						.fromNodeCallback(client.bulk, client)({body: bulk});
				});
			obs.subscribeOnError(cb);
			obs.subscribeOnCompleted(cb);
		},
		done => {
			var cb = _.once(done);

			var obs = payload
				.where(indexObj => _.isArray(indexObj.indices))
				.concatMap(indexObj => {
					return Rx.Observable
						.from(indexObj.indices);
				})
				.concatMap(cmd => {
					return Rx.Observable
						.fromNodeCallback((client, key, args, done) => {
							client.indices[key].apply(client.indices, args, done)
						})(client, cmd.key, cmd.args);
				});
				obs.subscribeOnError(cb);
				obs.subscribeOnCompleted(cb);
		}
	], callback);
});
