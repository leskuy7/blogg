require('dotenv').config();

const config = {
  db: {
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
  },
  auth: {
    user: process.env.EMAIL_USER || 'ixlsrlq4oh6bknc6@ethereal.email',
    pass: process.env.EMAIL_PASSWORD || '5TZgut3fCzmNYzVKJ7',
    from: process.env.EMAIL_FROM || 'ixlsrlq4oh6bknc6@ethereal.email'
  },
  app: {
    sessionSecret: process.env.SESSION_SECRET || 'your_secure_session_secret',
    port: process.env.PORT || 8080,
    environment: process.env.NODE_ENV || 'development'
  }
};

// For Sequelize CLI
module.exports = config.db;

// For application
module.exports.config = config;
