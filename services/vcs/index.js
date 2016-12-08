'use strict';

var nconf = require('nconf');
nconf
	.argv()
	.file({file: './defaults.json'});

var knex = require('knex')({
  client: 'mysql',
  connection: {
    database: nconf.get('db'),
    host: nconf.get('dbHost'),
    port: nconf.get('dbPort'),
    user: nconf.get('dbUser'),
    password: nconf.get('dbPassword')
  }
});

// TODO: add defaults for migration config
knex.migrate.latest();

/*
var seneca = require('seneca')();

var listen = seneca.listen({
	port: nconf.get('listenPort')
});

var client = seneca.client({
	host: nconf.get('clientHost'),
	port: nconf.get('clientPort')
});

TODO:
install eq8-api
create registrar for values
- it should register some new views (eq8-api) which in turn registers new query types in graphql (eq8)
create registrar for entities
- sample params: namespace, entity, version
create an action to register entities via messages
register value types
install seneca-knex-store
implement queries in seneca-knex-store using registered value types
*/

/*
downstream message schema
{
	vcs: {
		entity(uuid???): {
			id: uuid,
			version: bigInteger
			attribute: value
		}
	},
	index: {
		entity(uuid???): {
			mapping: {},
			insertSource: {
				locale: {
				}
			}
			previousVersions: [
				{schemaVersion, locale, entity, id}
			]
		}
	}
}
*/
