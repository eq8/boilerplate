'use strict';

var nconf = require('nconf');
nconf
	.env()
	.file({file: './defaults.json'});

module.exports = {
	production: {
		client: 'mysql',
		connection: {
			database: nconf.get('db'),
			host: nconf.get('DB_HOST'),
			port: nconf.get('DB_PORT'),
			user: nconf.get('DB_USER')
		},
		pool: {
			min: 2,
			max: 10
		},
		migrations: {
			tableName: 'migration'
		}
	}
};
