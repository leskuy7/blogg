require('dotenv').config();

module.exports = {
  development: {
    username: process.env.MYSQLUSER || "root",
    password: process.env.MYSQLPASSWORD || "",
    database: process.env.MYSQLDATABASE || "blogdb",
    host: process.env.MYSQLHOST || "localhost",
    port: parseInt(process.env.MYSQLPORT) || 3306,
    dialect: "mysql",
    logging: false
  },
  test: {
    username: process.env.MYSQLUSER || "root",
    password: process.env.MYSQLPASSWORD || "",
    database: process.env.MYSQLDATABASE + "_test" || "blogdb_test",
    host: process.env.MYSQLHOST || "localhost",
    port: parseInt(process.env.MYSQLPORT) || 3306,
    dialect: "mysql",
    logging: false
  },
  production: {
    use_env_variable: "MYSQL_URL",
    dialect: "mysql",
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
};
