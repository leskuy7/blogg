const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');
const { isAuthenticated } = require('../middlewares/all');
const checkRole = require('../middlewares/checkRole');
const createRateLimiter = require('../middlewares/rate-limit');
const { userValidationRules, validate, newPasswordValidationRules } = require('../middlewares/validation');

// Rate limiter for login attempts - 5 attempts per minute
const loginRateLimiter = createRateLimiter(5, 60000);

router.get('/register', authController.get_register);
router.post('/register', userValidationRules, validate, authController.post_register);

router.get('/login', authController.get_login);
router.post('/login', loginRateLimiter, authController.post_login);

router.get('/password-reset', authController.get_reset);
router.post('/password-reset', loginRateLimiter, authController.post_reset);

router.get('/password-new/:token', authController.get_new);
router.post('/password-new', newPasswordValidationRules, validate, authController.post_new);

router.get('/logout', authController.get_logout);

// Admin yetkilendirme sayfası - sadece admin erişebilir
router.get('/roles', isAuthenticated, checkRole(['admin']), authController.getRolesPage);

// Kullanıcıya rol atama işlemi - sadece admin erişebilir
router.post('/roles/assign', isAuthenticated, checkRole(['admin']), authController.postAssignRole);

// Email doğrulama
router.get('/verify-email/:token', authController.verifyEmail);

// Email doğrulama linkini yeniden gönder
router.get('/resend-verification', authController.getResendVerification);
router.post('/resend-verification', loginRateLimiter, authController.resendVerification);

module.exports = router;