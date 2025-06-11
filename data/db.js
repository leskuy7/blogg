const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
    process.env.DB_NAME || process.env.MYSQLDATABASE || 'railway',
    process.env.DB_USER || process.env.MYSQLUSER || 'root',
    process.env.DB_PASSWORD || process.env.MYSQLPASSWORD,
    {
        host: process.env.DB_HOST || process.env.MYSQLHOST,
        port: parseInt(process.env.DB_PORT || process.env.MYSQLPORT),
        dialect: 'mysql',
        dialectOptions: {
            ssl: {
                rejectUnauthorized: false
            },
            connectTimeout: 60000
        },
        logging: false,
        pool: {
            max: 10,
            min: 0,
            acquire: 60000,
            idle: 10000,
            evict: 1000,
            handleDisconnects: true
        },
        retry: {
            max: 5,
            backoffBase: 1000,
            backoffExponent: 1.5
        }
    }
);

// Veritabanı bağlantı durumunu kontrol et
sequelize.authenticate()
    .then(() => {
        console.log('Veritabanı bağlantısı başarılı.');
    })
    .catch(err => {
        console.error('Veritabanı bağlantı hatası:', err);
    });

module.exports = sequelize;