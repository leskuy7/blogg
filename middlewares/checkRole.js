const { logSecurity } = require('../helpers/logger');

module.exports = function (requiredRoles) {
    return async function (req, res, next) {
        if (!req.session.user) {
            logSecurity('warn', 'Role check failed - no user session', {
                ip: req.ip || req.connection.remoteAddress,
                userAgent: req.get('User-Agent'),
                requestedUrl: req.originalUrl,
                requiredRoles
            });
            req.flash('error', 'Lütfen giriş yapın.');
            return res.redirect('/auth/login');
        }

        const userRole = req.session.user.rolename; // Kullanıcının rolü oturumdan alınır

        // Admin her şeye yetkili
        if (userRole === 'admin') {
            return next();
        }

        // Gerekli rollerden birine sahipse devam et
        if (requiredRoles.includes(userRole)) {
            return next();
        }

        // Yetkisiz kullanıcılar için hata mesajı
        logSecurity('warn', 'Insufficient role permissions', {
            userId: req.session.user.userId,
            userRole,
            requiredRoles,
            requestedUrl: req.originalUrl,
            ip: req.ip || req.connection.remoteAddress
        });
        
        req.flash('error', 'Bu sayfaya erişim yetkiniz yok.');
        res.redirect('/');
    };
};