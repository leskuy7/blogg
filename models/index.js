'use strict';

const fs = require('fs');
const path = require('path');
const Sequelize = require('sequelize');
const process = require('process');
const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';
const config = require(__dirname + '/../config/config.js')[env];
const { logDatabase } = require('../helpers/logger');
const db = {};

let sequelize;
sequelize = new Sequelize(
  process.env.MYSQLDATABASE,
  process.env.MYSQLUSER,
  process.env.MYSQLPASSWORD,
  {
    host: process.env.MYSQLHOST,
    port: parseInt(process.env.MYSQLPORT),
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
  }
);

// Veritabanı bağlantı logları
sequelize.authenticate()
  .then(() => {
    logDatabase('info', 'Database connection established successfully', {
      database: config.database,
      host: config.host,
      dialect: config.dialect,
      environment: env
    });
    console.log('Database connection established successfully');
  })
  .catch(err => {
    logDatabase('error', 'Unable to connect to the database', {
      error: err.message
    });
    console.error('Unable to connect to the database:', err.message);
  });

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    const model = require(path.join(__dirname, file))(sequelize);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;