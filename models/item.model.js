const { Model } = require('objection');
const {v4: uuid} = require('uuid');
const knex = require('../database/db');

Model.knex(knex);
class Item extends Model {
    static get tableName() {
        return 'items';
    }

    static get idColumn() {
        return 'id';
    }

    $beforeInsert() {
        this.id = uuid();
    }
}

module.exports = Item;