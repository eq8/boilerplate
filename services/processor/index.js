'use strict';

var nconf = require('nconf');
nconf
	.argv()
	.env()
	.file({file: './defaults.json'});

var api = require('eq8-api')();

var seneca = require('seneca')();
seneca.use(require('seneca-beanstalk-transport'));
var listen = seneca.listen({
	type: 'beanstalk',
	host: nconf.get('HOST_QUEUE')
});
api.on('search', listen.add.bind(listen));
