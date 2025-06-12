const { Sequelize } = require('sequelize');
const config = require('../config');

let sequelize;

if (process.env.NODE_ENV === 'production') {
    sequelize = new Sequelize(process.env.MYSQL_URL, config.db.production);
} else {
    sequelize = new Sequelize(config.db.development);
}

module.exports = sequelize;