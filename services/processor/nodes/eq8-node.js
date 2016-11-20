module.exports = function(RED) {
	function action(config) {
		var node = this;
		var api = RED.settings.get('api');

		RED.nodes.createNode(node, config);

		var pattern = {};

		try {
			pattern = JSON.parse(config.pattern);
		} catch(e) {
			RED.log.error(e);
		}

		api.register({
			actions: [
				{
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
		});
	}

	RED.nodes.registerType('eq8 action', action);
};
