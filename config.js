require('dotenv').config();

const config = {
    db: {
        host: process.env.DB_HOST || 'switchback.proxy.rlwy.net',
        user: process.env.MYSQLUSER || 'root',
        password: process.env.MYSQL_ROOT_PASSWORD,
        database: process.env.MYSQL_DATABASE || 'railway',
        port: parseInt(process.env.DB_PORT) || 55611
    },
    auth: {
        user: process.env.EMAIL_USER || 'ixlsrlq4oh6bknc6@ethereal.email',
        pass: process.env.EMAIL_PASSWORD || '5TZgut3fCzmNYzVKJ7',
        from: process.env.EMAIL_FROM || 'ixlsrlq4oh6bknc6@ethereal.email'
    },
    app: {
        sessionSecret: process.env.SESSION_SECRET || 'your_secure_session_secret',
        port: process.env.PORT || 3000,
        environment: process.env.NODE_ENV || 'development'
    }
};

module.exports = config;