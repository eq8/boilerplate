exports.up = function(knex, Promise) {
	return Promise.all([
		knex.schema.createTable('version', function(t) {
			t.string('type');
			t.uuid('id');
			t.bigInteger('version');

			t.unique(['type', 'id', 'version']);
		}),
		knex.schema.createTable('entity', function(t) {
			t.string('entity');
			t.string('attribute');
			t.string('type');

			t.primary(['entity', 'attribute']);
		})
	]);
};

exports.down = function(knex, Promise) {
	return Promise.all([
		knex.schema.dropTable('version'),
		knex.schema.dropTable('entity')
	]);
};
