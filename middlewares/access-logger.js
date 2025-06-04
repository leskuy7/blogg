const { logAccess } = require('../helpers/logger');

// HTTP isteklerini loglayan middleware
const accessLogger = (req, res, next) => {
    const startTime = Date.now();
    
    // Response'un bittiğinde log yaz
    res.on('finish', () => {
        const responseTime = Date.now() - startTime;
        logAccess(req, res, responseTime);
    });
    
    next();
};

module.exports = accessLogger;
