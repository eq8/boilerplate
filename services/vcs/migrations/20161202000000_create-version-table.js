exports.up = function(knex, Promise) {
	return Promise.all([
		knex.schema.createTable('version', function(t) {
			t.string('type');
			t.uuid('id');
			t.bigInteger('version');

			t.unique(['type', 'id', 'version']);
		})
	]);
};

exports.down = function(knex, Promise) {
	return Promise.all([
		knex.schema.dropTable('version')
	]);
};
