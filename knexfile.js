module.exports = {
    development: {
        client: 'better-sqlite3',
        connection: {
            filename: './dev.db'
        },
        useNullAsDefault: true,
        migrations: {
            directory: './database/migrations'
        },
        seeds: {
            directory: './database/seeds'
        }
    }
};