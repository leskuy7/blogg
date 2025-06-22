const { Sequelize } = require('sequelize');
const config = require('../config');

const env = process.env.NODE_ENV || 'development';
const dbConfig = config.db[env];

let sequelize;
if (env === 'production' && process.env.MYSQL_URL) {
    sequelize = new Sequelize(process.env.MYSQL_URL, dbConfig);
} else {
    sequelize = new Sequelize(dbConfig.database, dbConfig.username, dbConfig.password, dbConfig);
}

module.exports = sequelize;