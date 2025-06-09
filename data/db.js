const { Sequelize } = require('sequelize');
const config = require('../config');

const sequelize = process.env.NODE_ENV === 'production' 
  ? new Sequelize(process.env.MYSQL_URL, {
      dialect: "mysql",
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false
        }
      },
      logging: false
    })
  : new Sequelize(config.db.database, config.db.user, config.db.password, {
      dialect: "mysql",
      host: config.db.host,
      port: config.db.port,
      logging: false,
      storage: './session.mysql',
      define: {
        timestamps: false
      }
});


module.exports = sequelize;