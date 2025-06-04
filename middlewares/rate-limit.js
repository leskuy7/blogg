const rateLimit = {};
const { logSecurity } = require('../helpers/logger');

/**
 * Simple rate limiting middleware
 * @param {number} maxRequests - Maximum number of requests allowed
 * @param {number} windowMs - Time window in milliseconds
 * @returns {Function} - Express middleware function
 */
module.exports = function createRateLimiter(maxRequests = 5, windowMs = 60000) {
    return function rateLimitMiddleware(req, res, next) {
        const ip = req.ip || req.connection.remoteAddress;
        const now = Date.now();
        
        // Initialize tracking for this IP if it doesn't exist
        if (!rateLimit[ip]) {
            rateLimit[ip] = {
                count: 0,
                resetTime: now + windowMs
            };
        }
        
        // Reset count if time window has passed
        if (now > rateLimit[ip].resetTime) {
            rateLimit[ip].count = 0;
            rateLimit[ip].resetTime = now + windowMs;
        }
        
        // Increment request count
        rateLimit[ip].count++;
        
        // Check if rate limit exceeded
        if (rateLimit[ip].count > maxRequests) {
            const remainingTime = Math.ceil((rateLimit[ip].resetTime - now) / 1000);
            
            logSecurity('warn', 'Rate limit exceeded', {
                ip,
                userAgent: req.get('User-Agent'),
                requestedUrl: req.originalUrl,
                method: req.method,
                requestCount: rateLimit[ip].count,
                maxRequests,
                windowMs,
                remainingTime
            });
            
            // AJAX istekleri için JSON response
            if (req.xhr || req.headers.accept?.includes('application/json')) {
                return res.status(429).json({
                    error: 'Rate limit exceeded',
                    message: `Çok fazla deneme yaptınız. ${remainingTime} saniye sonra tekrar deneyin.`,
                    retryAfter: remainingTime
                });
            }
            
            // Normal istekler için hata sayfası
            return res.status(429).render('error/rate-limit', {
                title: 'Çok Fazla İstek',
                message: `Çok fazla deneme yaptınız. Lütfen ${remainingTime} saniye bekleyip tekrar deneyin.`,
                remainingTime: remainingTime,
                maxRequests: maxRequests,
                windowMs: Math.ceil(windowMs / 1000)
            });
        }
        
        next();
    };
};
