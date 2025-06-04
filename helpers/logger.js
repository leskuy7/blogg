const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Logs klasörünü oluştur
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Winston format tanımlamaları
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
);

const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
        const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
        return `${timestamp} [${level}]: ${message} ${stack ? '\n' + stack : ''} ${metaStr}`;
    })
);

// Ana logger - sadece error ve combined için
const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: logFormat,
    defaultMeta: { service: 'blogapp' },
    transports: [
        // Error logs - sadece error ve üstü
        new winston.transports.File({
            filename: path.join(logsDir, 'error.log'),
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            )
        }),
        
        // Combined logs - tüm loglar
        new winston.transports.File({
            filename: path.join(logsDir, 'combined.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5,
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            )
        })
    ]
});

// Kategori özel loggerlar
const accessLogger = winston.createLogger({
    level: 'info',
    format: logFormat,
    defaultMeta: { service: 'blogapp' },
    transports: [
        new winston.transports.File({
            filename: path.join(logsDir, 'access.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5,
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            )
        })
    ]
});

const authLogger = winston.createLogger({
    level: 'info',
    format: logFormat,
    defaultMeta: { service: 'blogapp' },
    transports: [
        new winston.transports.File({
            filename: path.join(logsDir, 'auth.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5,
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            )
        })
    ]
});

const databaseLogger = winston.createLogger({
    level: 'info',
    format: logFormat,
    defaultMeta: { service: 'blogapp' },
    transports: [
        new winston.transports.File({
            filename: path.join(logsDir, 'database.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5,
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json()
            )
        })
    ]
});

// Development ortamında console'a da yazdır
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: consoleFormat
    }));
}

// Özel logger fonksiyonları
const logAuth = (level, message, meta = {}) => {
    const logData = { ...meta, category: 'auth' };
    authLogger.log(level, message, logData);
    logger.log(level, message, logData); // Combined log için
};

const logDatabase = (level, message, meta = {}) => {
    const logData = { ...meta, category: 'database' };
    databaseLogger.log(level, message, logData);
    logger.log(level, message, logData); // Combined log için
};

const logAccess = (req, res, responseTime) => {
    const logData = {
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        responseTime: `${responseTime}ms`,
        userAgent: req.get('User-Agent'),
        ip: req.ip || req.connection.remoteAddress,
        user: req.session && req.session.user ? req.session.user.email : 'Anonymous',
        category: 'access'
    };
    
    if (res.statusCode >= 400) {
        accessLogger.error('HTTP Error', logData);
        logger.error('HTTP Error', logData); // Combined log için
    } else {
        accessLogger.info('HTTP Request', logData);
        logger.info('HTTP Request', logData); // Combined log için
    }
};

const logBusiness = (level, action, details = {}) => {
    const logData = {
        ...details,
        category: 'business'
    };
    logger.log(level, `Business Action: ${action}`, logData);
};

const logSecurity = (level, event, details = {}) => {
    const logData = {
        ...details,
        event: event,
        category: 'security'
    };
    logger.log(level, `Security Event: ${event}`, logData);
};

module.exports = {
    logger,
    logAuth,
    logDatabase,
    logAccess,
    logBusiness,
    logSecurity
};
