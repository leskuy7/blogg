const { body, validationResult } = require('express-validator');

// Blog validation rules
const blogValidationRules = [
    body('title')
        .trim()
        .isLength({ min: 3, max: 200 })
        .withMessage('Başlık 3-200 karakter arasında olmalıdır')
        .matches(/^[a-zA-ZÇĞıİÖŞÜçğıöşü0-9\s\-\.,:;!?\(\)]+$/)
        .withMessage('Başlıkta geçersiz karakterler bulunmaktadır'),
    body('altbaslik')
        .trim()
        .isLength({ min: 3, max: 300 })
        .withMessage('Alt başlık 3-300 karakter arasında olmalıdır'),
    body('content')
        .trim()
        .isLength({ min: 10 })
        .withMessage('İçerik en az 10 karakter olmalıdır'),
];

// User registration validation rules
const userValidationRules = [
    body('fullname')
        .trim()
        .isLength({ min: 3, max: 50 })
        .withMessage('Ad Soyad 3-50 karakter arasında olmalıdır')
        .matches(/^[a-zA-ZÇĞıİÖŞÜçğıöşü\s]+$/)
        .withMessage('Ad Soyad sadece harf ve boşluk içermelidir'),
    body('email')
        .isEmail()
        .withMessage('Geçerli bir e-posta adresi giriniz')
        .normalizeEmail()
        .isLength({ max: 100 })
        .withMessage('E-posta adresi çok uzun'),
    body('password')
        .isLength({ min: 6, max: 50 })
        .withMessage('Şifre 6-50 karakter arasında olmalıdır')
        .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
        .withMessage('Şifre en az bir harf ve bir rakam içermelidir'),
    body('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Şifreler eşleşmiyor');
        }
        return true;
    })
];

// User login validation rules
const loginValidationRules = [
    body('email')
        .isEmail()
        .withMessage('Geçerli bir e-posta adresi giriniz')
        .normalizeEmail(),
    body('password')
        .notEmpty()
        .withMessage('Şifre alanı boş olamaz')
];

// Category validation rules
const categoryValidationRules = [
    body('name')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Kategori adı 2-50 karakter arasında olmalıdır')
        .matches(/^[a-zA-ZÇĞıİÖŞÜçğıöşü0-9\s\-]+$/)
        .withMessage('Kategori adında geçersiz karakterler bulunmaktadır')
];

// Category name validation for editing
const categoryEditValidationRules = [
    body('categoryName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Kategori adı 2-50 karakter arasında olmalıdır')
        .matches(/^[a-zA-ZÇĞıİÖŞÜçğıöşü0-9\s\-]+$/)
        .withMessage('Kategori adında geçersiz karakterler bulunmaktadır')
];

// Password reset validation rules
const passwordResetValidationRules = [
    body('email')
        .isEmail()
        .withMessage('Geçerli bir e-posta adresi giriniz')
        .normalizeEmail()
];

// New password validation rules
const newPasswordValidationRules = [
    body('password')
        .isLength({ min: 6, max: 50 })
        .withMessage('Şifre 6-50 karakter arasında olmalıdır')
        .matches(/^(?=.*[A-Za-z])(?=.*\d)/)
        .withMessage('Şifre en az bir harf ve bir rakam içermelidir'),
    body('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Şifreler eşleşmiyor');
        }
        return true;
    })
];

// Enhanced validate function with better error handling
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }
    
    const extractedErrors = [];
    errors.array().map(err => extractedErrors.push(err.msg));
    
    // Store validation errors in flash messages
    extractedErrors.forEach(error => {
        req.flash('error', error);
    });
    
    // Preserve form data including file information
    req.session.formData = {
        ...req.body,
        hasFile: req.file ? true : false,
        fileName: req.file ? req.file.filename : null
    };
    
    // Güvenli redirect - belirli URL'lere yönlendirme
    const referrer = req.get('Referrer') || req.get('Referer');
    let redirectUrl = '/';
    
    // Sadece aynı domain'den gelen istekleri kabul et
    if (referrer) {
        try {
            const referrerUrl = new URL(referrer);
            const currentHost = req.get('host');
            
            // Aynı host kontrolü
            if (referrerUrl.host === currentHost) {
                redirectUrl = referrerUrl.pathname + (referrerUrl.search || '');
            }
        } catch (error) {
            console.error('Invalid referrer URL:', error);
            // Hatalı URL durumunda default'a dön
        }
    }
    
    // Bilinen güvenli rotalar listesi
    const safeRoutes = [
        '/admin/blog/create',
        '/admin/blog/edit',
        '/admin/category/create',
        '/auth/register',
        '/auth/login',
        '/auth/password-new' // Bu satırı ekle
    ];
    
    // Eğer mevcut path güvenli rotalar listesindeyse, oraya dön
    const currentPath = req.path;
    if (safeRoutes.some(route => currentPath.startsWith(route))) {
        redirectUrl = req.originalUrl;
    }
    
    return res.redirect(redirectUrl);
};

// Specific validate function for API responses
const validateApi = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next();
    }
    
    const extractedErrors = [];
    errors.array().map(err => extractedErrors.push({
        field: err.param,
        message: err.msg,
        value: err.value
    }));
    
    return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: extractedErrors
    });
};

module.exports = {
    blogValidationRules,
    userValidationRules,
    loginValidationRules,
    categoryValidationRules,
    categoryEditValidationRules,
    passwordResetValidationRules,
    newPasswordValidationRules,
    validate,
    validateApi
};
