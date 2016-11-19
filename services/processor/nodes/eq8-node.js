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
						node.send({
							trx: ctxt.trx,
							user: ctxt.user,
							body: action,
							commit: done
						});
					}
				}
			]
		});
	}

	RED.nodes.registerType('eq8 action', action);
};
