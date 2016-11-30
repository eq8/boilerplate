exports.up = function(knex, Promise) {
	return Promise.all([
		knex.schema.createTable('log', function(table) {
			table.timestamps();
		})
	]);
};

exports.down = function(knex, Promise) {
	return Promise.all([
		knex.schema.dropTable('log')
	]);
};
