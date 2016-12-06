exports.up = function(knex, Promise) {
	return Promise.all([
		knex.schema.createTable('lock', function(t) {
			t.string('entity');
			t.uuid('id');
			t.bigInteger('version');
			t.string('attribute');

			t.unique(['entity', 'id', 'version', 'attribute']);
		})
	]);
};

exports.down = function(knex, Promise) {
	return Promise.all([
		knex.schema.dropTable('lock')
	]);
};
