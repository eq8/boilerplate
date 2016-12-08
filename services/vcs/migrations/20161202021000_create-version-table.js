exports.up = function(knex, Promise) {
	return Promise.all([
		knex.schema.createTable('version', function(t) {
			t.string('entity');
			t.uuid('id');
			t.string('attribute');
			t.bigInteger('version');

			t.unique(['entity', 'id', 'attribute', 'version']);
		})
	]);
};

exports.down = function(knex, Promise) {
	return Promise.all([
		knex.schema.dropTable('version')
	]);
};
