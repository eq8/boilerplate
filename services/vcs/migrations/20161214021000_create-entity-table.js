exports.up = function(knex, Promise) {
	return Promise.all([
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
		knex.schema.dropTable('entity')
	]);
};
