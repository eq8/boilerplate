var nconf = require('nconf');
nconf
	.argv()
	.file({file: './defaults.json'});

var seneca = require('seneca')();
seneca.use(require('seneca-amqp-transport'));

var client = seneca.client({
	type: 'amqp',
	host: nconf.get('queueUrl'),
	pin: 'to:vcs'
});

module.exports = function(RED) {
	function store() {
		var node = this;

		node.on('input', function(msg) {
			client.act(Object.assign({to: 'vcs'}, {body: msg}), (err, payload) => {
				node.send(Object.assign({}, {error: err, payload: payload}));
			});
		});
	}

	RED.nodes.registerType('eq8 store', store);
};
