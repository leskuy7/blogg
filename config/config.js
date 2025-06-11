require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "blogdb",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT) || 3306,
    dialect: "mysql",
    logging: false
  },
  test: {
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME + "_test" || "blogdb_test",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT) || 3306,
    dialect: "mysql",
    logging: false
  },
  production: {
    username: process.env.MYSQLUSER || "root",
    password: process.env.MYSQL_ROOT_PASSWORD,
    database: process.env.MYSQL_DATABASE || "railway",
    host: process.env.DB_HOST || "switchback.proxy.rlwy.net",
    port: parseInt(process.env.DB_PORT) || 55611,
    dialect: "mysql",
    dialectOptions: {
      ssl: {
        rejectUnauthorized: false
      }
    },
    logging: false
  }
};
