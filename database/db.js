const knex = require("knex");
const config = require('../knexfile.js');

const environment = 'development';
const connectionConfig = config[environment];

const connection = knex(connectionConfig);

module.exports = connection;