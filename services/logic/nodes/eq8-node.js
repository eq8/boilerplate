module.exports = function(RED) {
	function mutation(config) {
		var node = this;
		var api = RED.settings.get('api');

		var pattern = {};

		try {
			pattern = JSON.parse(config.pattern);
		} catch(e) {
			RED.log.error(e);
		}

		api.register({
			actions: [
				{
					id: config.id,
					name: config.name,
					pattern: pattern,
					handler: function(ctxt, action, done) {
						node.send({
							user: ctxt.user,
							body: action
						});

						setImmediate(done);
					}
				}
			]
		}, function(err) {
			if(err) {
				RED.log.error(err);
			}

			RED.nodes.createNode(node, config);

			node.on('close', function(done) {
				api.deregister('actions', this.id);
				done();
			});
		});
	}

	function query(config) {
		var node = this;
		var api = RED.settings.get('api');

		var pattern = {};

		try {
			pattern = JSON.parse(config.pattern);
		} catch(e) {
			RED.log.error(e);
		}

		api.register({
			views: [
				{
					id: config.id,
					name: config.name,
					pattern: pattern,
					handler: function(ctxt, view, done) {
						node.send({
							user: ctxt.user,
							body: view,
							callback: done
						});
					}
				}
			]
		}, function(err) {
			if(err) {
				RED.log.error(err);
			}

			RED.nodes.createNode(node, config);

			node.on('close', function(done) {
				api.deregister('views', this.id);
				done();
			});
		});
	}

	function output() {
		var node = this;
		var api = RED.settings.get('api');

		node.on('input', function(msg) {
			api.dispatch({
				to: 'vcs',
				items: msg.items
			});
		});
	}

	RED.nodes.registerType('eq8 mutation', mutation);
	RED.nodes.registerType('eq8 query', query);
	RED.nodes.registerType('eq8 output', output);
};
