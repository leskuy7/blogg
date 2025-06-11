const { logSecurity } = require('../helpers/logger');

function isAuthenticated(req, res, next) {
    if (!req.session.isAuth) {
        logSecurity('warn', 'Unauthorized access attempt', {
            ip: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent'),
            requestedUrl: req.originalUrl,
            method: req.method
        });
        req.flash('error', 'Lütfen giriş yapın.');
        return res.redirect('/auth/login?returnUrl=' + encodeURIComponent(req.originalUrl));
    }
    next();
}

// Flash mesajlarını yerel değişkenlere aktar
function flashMessages(req, res, next) {
    res.locals.messages = req.flash();
    next();
}

// HTML etiketlerini temizlemek için striptags fonksiyonunu yerel değişkenlere aktar
function stripTags(req, res, next) {
    res.locals.stripTags = require('striptags');
    next();
}

// Geçerli yolu yerel değişkenlere aktar
function currentPath(req, res, next) {
    res.locals.path = req.path;
    next();
}

module.exports = {
    flashMessages,
    isAuthenticated,
    stripTags,
    currentPath
};