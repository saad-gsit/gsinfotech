require('dotenv').config();

module.exports = {
    development: {
        // username: process.env.DB_USER || 'root',
        // password: process.env.DB_PASSWORD || 'root',
        // database: process.env.DB_NAME || 'gsinfotech_db',
        // host: process.env.DB_HOST || 'localhost',
        // port: process.env.DB_PORT || 3306,
        username: process.env.DB_USER || 'sql12794174',
        password: process.env.DB_PASSWORD || 'hQfNvkd3Ef',
        database: process.env.DB_NAME || 'sql12794174',
        host: process.env.DB_HOST || 'sql12.freesqldatabase.com',
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        logging: console.log,
        pool: {
            max: 10,
            min: 0,
            acquire: 30000,
            idle: 10000
        },
        define: {
            timestamps: true,
            underscored: true,
            freezeTableName: true
        },
        dialectOptions: {
            charset: 'utf8mb4'
            // Remove collate to fix the warning
        }
    },
    test: {
        username: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || 'root',
        database: (process.env.DB_NAME || 'gsinfotech_db') + '_test',
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        logging: false
    },
    production: {
        username: process.env.DB_USER || 'sql12794174',
        password: process.env.DB_PASSWORD || 'hQfNvkd3Ef',
        database: process.env.DB_NAME || 'sql12794174',
        host: process.env.DB_HOST || 'sql12.freesqldatabase.com',
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        logging: false,
        pool: {
            max: 20,
            min: 5,
            acquire: 60000,
            idle: 10000
        }
    }
};