require('dotenv').config();

module.exports = {
    development: {
        // username: process.env.DB_USER || 'root',
        // password: process.env.DB_PASSWORD || 'root',
        // database: process.env.DB_NAME || 'gsinfotech_db',
        // host: process.env.DB_HOST || 'localhost',
        // port: process.env.DB_PORT || 3306,
        username: process.env.DB_USER || 'u226800403_gsinfo',
        password: process.env.DB_PASSWORD || 'Gsinfo@3686',
        database: process.env.DB_NAME || 'u226800403_gsinfotech_db',
        host: process.env.DB_HOST || 'srv1474.hstgr.io',
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
        username: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        host: process.env.DB_HOST,
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