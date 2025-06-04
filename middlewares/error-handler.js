const { logger } = require('../helpers/logger');

// Error logger middleware
const errorLogger = (err, req, res, next) => {
    const userAgent = req.get('User-Agent') || 'Unknown';
    const ip = req.ip || req.connection.remoteAddress || 'Unknown';
    const user = req.session && req.session.user ? req.session.user.email : 'Anonymous';
    
    const errorLogData = {
        method: req.method,
        url: req.originalUrl,
        userAgent,
        ip,
        user,
        errorName: err.name,
        errorCode: err.code,
        category: 'error'
    };

    // Winston logger ile error log
    logger.error(err.message, {
        ...errorLogData,
        stack: err.stack
    });

    next(err);
};

// Global error handler
const errorHandler = (err, req, res, next) => {
    // Default values
    let statusCode = 500;
    let message = 'Sunucuda bir hata oluştu';
    let redirectTo = '/';

    // Handle specific error types
    if (err.name === 'ValidationError') {
        statusCode = 400;
        message = 'Geçersiz veri gönderildi';
    } else if (err.name === 'SequelizeValidationError') {
        statusCode = 400;
        message = 'Veritabanı doğrulama hatası';
    } else if (err.name === 'SequelizeUniqueConstraintError') {
        statusCode = 409;
        message = 'Bu kayıt zaten mevcut';
    } else if (err.name === 'SequelizeDatabaseError') {
        statusCode = 500;
        message = 'Veritabanı bağlantı hatası';
    } else if (err.name === 'MulterError') {
        statusCode = 400;
        if (err.code === 'LIMIT_FILE_SIZE') {
            message = 'Dosya boyutu çok büyük (maksimum 5MB)';
        } else if (err.code === 'LIMIT_FILE_COUNT') {
            message = 'Çok fazla dosya yüklendi';
        } else {
            message = 'Dosya yükleme hatası';
        }
    } else if (err.code === 'EBADCSRFTOKEN') {
        statusCode = 403;
        message = 'Geçersiz CSRF token';
        redirectTo = req.get('Referer') || '/';
    }    // Development ortamında detaylı hata göster
    if (process.env.NODE_ENV === 'development') {
        logger.debug('Error details', {
            name: err.name,
            message: err.message,
            stack: err.stack,
            code: err.code,
            category: 'debug'
        });
    }

    // Flash message ayarla
    if (req.flash) {
        req.flash('error', message);
    }    // Response'un zaten gönderilip gönderilmediğini kontrol et
    if (res.headersSent) {
        return next(err);
    }

    // AJAX istekleri için JSON response
    if (req.xhr || req.headers.accept?.includes('application/json')) {
        return res.status(statusCode).json({
            success: false,
            message,
            ...(process.env.NODE_ENV === 'development' && { 
                error: err.message, 
                stack: err.stack 
            })
        });
    }

    // Normal istekler için redirect
    return res.redirect(redirectTo);
};

// 404 handler
const notFoundHandler = (req, res, next) => {
    res.status(404).render('error/404', {
        title: 'Sayfa Bulunamadı',
        message: 'Aradığınız sayfa bulunamadı',
        path: req.path
    });
};

module.exports = {
    errorLogger,
    errorHandler,
    notFoundHandler
};
