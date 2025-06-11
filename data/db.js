const { Sequelize } = require('sequelize');
require('dotenv').config();

const isProduction = process.env.NODE_ENV === 'production';

const sequelize = new Sequelize(
    process.env.MYSQL_DATABASE || 'railway',
    process.env.MYSQLUSER || 'root',
    process.env.MYSQL_ROOT_PASSWORD,
    {
        host: process.env.DB_HOST || 'switchback.proxy.rlwy.net',
        port: parseInt(process.env.DB_PORT) || 55611,
        dialect: 'mysql',
        dialectOptions: isProduction ? {
            ssl: {
                rejectUnauthorized: false
            }
        } : {},
        logging: false,
        pool: {
            max: 5,
            min: 0,
            acquire: 30000,
            idle: 10000
        }
    }
);

module.exports = sequelize;