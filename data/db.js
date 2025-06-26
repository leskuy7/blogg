const { Sequelize } = require('sequelize');

// Railway ortamı için doğrudan env'den oku
const sequelize = new Sequelize(
  process.env.MYSQLDATABASE,
  process.env.MYSQLUSER,
  process.env.MYSQLPASSWORD,
  {
    host: process.env.MYSQLHOST,
    port: process.env.MYSQLPORT,
    dialect: 'mysql',
    logging: false
  }
);

module.exports = sequelize;