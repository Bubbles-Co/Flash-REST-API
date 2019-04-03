module.exports = {
    client: 'pg',
    connection: process.env.DB_CONNECTION_STRING,
    migrations: {
        tableName: 'knex_migrations'
    },
    seeds: {
        directory: './seeds'
    }
}