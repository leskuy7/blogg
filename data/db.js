const { Sequelize } = require('sequelize');
require('dotenv').config();

let sequelize;

if (process.env.NODE_ENV === 'production') {
    sequelize = new Sequelize(process.env.MYSQL_URL, {
        dialect: 'mysql',
        dialectOptions: {
            ssl: {
                rejectUnauthorized: false
            },
            connectTimeout: 60000
        },
        pool: {
            max: 5,
            min: 0,
            acquire: 60000,
            idle: 10000
        },
        logging: false
    });
} else {
    sequelize = new Sequelize({
        dialect: 'mysql',
        host: process.env.MYSQLHOST,
        port: parseInt(process.env.MYSQLPORT),
        username: process.env.MYSQLUSER,
        password: process.env.MYSQLPASSWORD,
        database: process.env.MYSQLDATABASE,
        logging: false
    });
}

module.exports = sequelize;