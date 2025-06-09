require('dotenv').config();

const config = {
    db: {
        host: process.env.MYSQLHOST || process.env.DB_HOST || 'localhost',
        user: process.env.MYSQLUSER || process.env.DB_USER || 'root',
        password: process.env.MYSQL_ROOT_PASSWORD || process.env.DB_PASSWORD || '',
        database: process.env.MYSQL_DATABASE || process.env.DB_NAME || 'blogdb',
        port: process.env.MYSQLPORT || process.env.DB_PORT || 3306
    },
    auth: {
        user: process.env.EMAIL_USER || 'ixlsrlq4oh6bknc6@ethereal.email',
        pass: process.env.EMAIL_PASSWORD || '5TZgut3fCzmNYzVKJ7',
        from: process.env.EMAIL_FROM || 'ixlsrlq4oh6bknc6@ethereal.email'
    },
    app: {
        sessionSecret: process.env.SESSION_SECRET || 'secret',
        port: process.env.PORT || 3000,
        environment: process.env.NODE_ENV || 'development'
    }
};

module.exports = config;