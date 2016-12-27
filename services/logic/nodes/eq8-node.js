module.exports = function(RED) {
	function input(config) {
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

	RED.nodes.registerType('eq8 input', input);
	RED.nodes.registerType('eq8 output', output);
};
