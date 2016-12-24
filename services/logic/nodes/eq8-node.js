module.exports = function(RED) {
	function action(config) {
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
						var invoked = false;

						node.send({
							user: ctxt.user,
							body: action,
							reply: function(err) {
								if(!invoked) {
									invoked = true;
									done(err);
								} else {
									RED.log.error('`msg.reply` can only be invoked once');
								}
							}
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
				api.deregister('actions', this.id);
				done();
			});
		});
	}

	RED.nodes.registerType('eq8 action', action);
};
