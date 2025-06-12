const { Sequelize } = require('sequelize');
require('dotenv').config();

console.log('Initializing database connection with:', {
    host: process.env.MYSQLHOST,
    port: process.env.MYSQLPORT,
    database: process.env.MYSQLDATABASE,
    user: process.env.MYSQLUSER
});

const sequelize = new Sequelize({
    dialect: 'mysql',
    host: process.env.MYSQLHOST,
    port: parseInt(process.env.MYSQLPORT || "3306"),
    username: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
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

module.exports = sequelize;