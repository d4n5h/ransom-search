/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    return knex.schema.createTable('items', (table) => {
        table.uuid('id').primary();
        table.string('target');
        table.string('group');
        table.string('website');
        table.string('post_url');
        table.text('description');
        table.datetime('discovered');
        table.datetime('published');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTableIfExists('items');
};
