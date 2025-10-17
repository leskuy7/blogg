const { User, sequelize } = require("../models");
const bcrypt = require('bcrypt');
const config = require('../config');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { Op } = require('sequelize');
const { logAuth, logBusiness, logSecurity, logger } = require('../helpers/logger');

exports.get_register = async function (req, res) {
    try {
        const message = req.session.message || null; // Mesajı session'dan al
        delete req.session.message; // Mesajı bir kez gösterdikten sonra sil

        res.render('auth/register', {
            title: 'Register',
            activePage: 'register',
            message: message, // Mesajı şablona gönder
            formData: req.session.formData || {}, // Form verilerini şablona gönder
            csrfToken: req.csrfToken() // CSRF token'ı şablona gönder
        });    
    } catch (err) {
        logger.error('Registration page error', { error: err.message, stack: err.stack });
        res.status(500).send("Bir hata oluştu: " + err.message);
    }
};

exports.post_register = async function (req, res) {
    const { fullname, email, password, confirmPassword } = req.body;

    logAuth('info', 'User registration attempt', { 
        email, 
        fullname, 
        ip: req.ip || req.connection.remoteAddress 
    });

    if (password !== confirmPassword) {
        logAuth('warn', 'Registration failed - password mismatch', { email, ip: req.ip });
        return res.render('auth/register', {
            title: 'Register',
            activePage: 'register',
            message: { class: 'danger', text: 'Şifreler eşleşmiyor!' },
            formData: req.body,
            csrfToken: req.csrfToken()
        });
    }

    try {
        const user = await User.findOne({ where: { email } });
        if (user) {
            logAuth('warn', 'Registration failed - email already exists', { 
                email, 
                ip: req.ip,
                existingUserId: user.userId 
            });
            return res.render('auth/register', {
                title: 'Register',
                activePage: 'register',
                message: { class: 'danger', text: 'Bu e-posta adresi zaten kayıtlı!' },
                formData: req.body,
                csrfToken: req.csrfToken()
            });
        }

        const hashedPassword = await bcrypt.hash(password, 6);
        
        // Email doğrulama token'ı oluştur
        const emailVerificationToken = crypto.randomBytes(32).toString('hex');
        const newUser = await User.create({
            fullname,
            email,
            password: hashedPassword,
            rolename: "user",
            isEmailVerified: false,
            emailVerificationToken: emailVerificationToken,
            emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000 // 24 saat
        });

        // DB'ye yazıldığını doğrulamak için logla
        logger.info('New user created', { user: newUser.toJSON ? newUser.toJSON() : newUser });

        logAuth('info', 'User registered successfully', { 
            userId: newUser.userId,
            email: newUser.email,
            fullname: newUser.fullname,
            ip: req.ip 
        });

        logBusiness('info', 'NEW_USER_REGISTRATION', {
            userId: newUser.userId,
            email: newUser.email,
            registrationDate: new Date().toISOString()
        });

        // --- DEĞİŞTİRME: SMTP ile gönderim yerine doğrulama linkini konsola yazdır ---
        try {
            const verificationLink = `http://localhost:${process.env.PORT || 3001}/auth/verify-email/${emailVerificationToken}`;
            // Konsola ve loglara yazdır (çevrimdışı geliştirme için)
            console.log('Email verification link (development):', verificationLink);
            logger.info('Email verification link (development)', { link: verificationLink, userId: newUser.userId, email: newUser.email });
        } catch (err) {
            logger.error('Failed to output verification link to console', { error: err.message, stack: err.stack, userId: newUser.userId });
        }
        // --- /DEĞİŞTİRME ---

        req.flash('success', 'Kayıt başarılı! Doğrulama linki konsola yazdırıldı (geliştirme).');
        res.redirect('/auth/login');
    } catch (err) {
        logger.error('Registration error', { 
            error: err.message, 
            stack: err.stack,
            email,
            ip: req.ip 
        });
        return res.render('auth/register', {
            title: 'Register',
            activePage: 'register',
            message: { class: 'danger', text: 'Kayıt sırasında bir hata oluştu.' },
            formData: req.body
        });
    }
};

exports.get_login = async function (req, res) {
    if (req.session.isAuth) {
        req.flash('error', 'Zaten giriş yaptınız!');
        return res.redirect('/'); 
    }
    const message = req.session.message;
    delete req.session.message;
    try {
        return res.render('auth/login', {
            title: 'Login',
            activePage: 'login',
            returnUrl: req.query.returnUrl || '/',
            message: message,
            csrfToken: req.csrfToken(),
        });
    } catch (err) {
        console.error(err);
    }
};

exports.post_login = async function (req, res) {
    const { email, password, returnUrl } = req.body;
    try {
        const user = await User.findOne({ where: { email } });

        // 1. ÖNCE HER ŞEYİ KONTROL ET
        if (!user) {
            req.flash('error', 'Email veya şifre hatalı!'); // Genel mesaj
            return res.redirect('/auth/login?returnUrl=' + encodeURIComponent(returnUrl));
        }

        // 2. ŞİFREYİ KONTROL ET
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            req.flash('error', 'Email veya şifre hatalı!'); // Aynı genel mesaj
            return res.redirect('/auth/login?returnUrl=' + encodeURIComponent(returnUrl));
        }

        // 3. SADECE ŞİFRE DOĞRUYSA EMAIL DURUMUNU KONTROL ET
        if (!user.isEmailVerified) {
            req.flash('error', 'Lütfen önce email adresinizi doğrulayın. Email kutunuzu kontrol edin.');
            return res.redirect('/auth/login?returnUrl=' + encodeURIComponent(returnUrl));
        }

        // 4. HERŞEY TAMAM, GİRİŞ YAP
        req.session.user = {
            userId: user.userId,
            fullname: user.fullname,
            rolename: user.rolename
        };
        req.session.isAuth = true;
        req.flash('success', 'Başarıyla giriş yaptınız!');
        return req.session.save(err => {
            if (err) {
                console.error(err);
            }
            res.redirect(returnUrl || '/');
        });

    } catch (err) {
        console.error(err);
        req.flash('error', 'Giriş sırasında bir hata oluştu.');
        res.redirect('/auth/login?returnUrl=' + encodeURIComponent(returnUrl));
    }
};

exports.get_reset = async function (req, res) {
    try {
        return res.render('auth/password-reset', {
            title: 'Şifre Sıfırlama',
            csrfToken: req.csrfToken()
        });
    } catch (err) {
        console.error(err);
        req.flash('error', 'Şifre sıfırlama sırasında bir hata oluştu.');
        res.redirect('/auth/login');
    }
};

exports.post_reset = async function (req, res) {
    const { email } = req.body;
    try {
        const transporter2 = require('../helpers/send-mail');
        const token = crypto.randomBytes(32).toString('hex');
        const user = await User.findOne({ where: { email } });

        if (!user) {
            req.flash('error', 'Bu e-posta adresi kayıtlı değil!');
            return res.redirect('/auth/password-reset');
        }

        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000; // 1 saat geçerli
        await user.save();

        transporter2.sendMail(
            {
                from: (config.email && config.email.from) || process.env.EMAIL_FROM || 'no-reply@example.com',
                to: email,
                subject: "Şifre Sıfırlama",
                html: `
                    <div style="text-align: center">
                        <h1>Merhaba ${user.fullname}</h1>
                        <p>Şifrenizi sıfırlamak için aşağıdaki bağlantıya tıklayın:</p>
                        <a href="http://localhost:${process.env.PORT || 3001}/auth/password-new/${token}">Şifre Sıfırla</a>
                        <p>Bu bağlantı 1 saat boyunca geçerlidir.</p>
                    </div>
                `,
            },
            (err, info) => {
                if (err) {
                    console.error("E-posta gönderim hatası:", err);
                    req.flash('error', 'E-posta gönderilirken bir hata oluştu.');
                    return res.redirect('/auth/password-reset');
                } else {
                    console.log("E-posta gönderildi, önizleme URL'si:", nodemailer.getTestMessageUrl(info));
                    req.flash('success', 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.');
                    return res.redirect('/auth/login');
                }
            }
        );
    } catch (err) {
        console.error(err);
        req.flash('error', 'Şifre sıfırlama sırasında bir hata oluştu.');
        res.redirect('/auth/login');
    }
};

exports.get_new = async function (req, res) {
    const token = req.params.token;
    try {
        const user = await User.findOne({
            where: {
                resetToken: token,
                resetTokenExpiration: { [Op.gt]: Date.now() }
            }
        });

        if (!user) {
            req.flash('error', 'Geçersiz veya süresi dolmuş bağlantı!');
            return res.redirect('/auth/password-reset');
        }

        // Form data'yı session'dan al ve temizle
        const formData = req.session.formData || {};
        delete req.session.formData;

        return res.render('auth/password-new', {
            title: 'Yeni Şifre',
            csrfToken: req.csrfToken(),
            userId: user.userId,
            token: token,
            formData: formData // Form data'yı şablona gönder
        });
    } catch (err) {
        console.error(err);
        req.flash('error', 'Şifre sıfırlama sırasında bir hata oluştu.');
        res.redirect('/auth/password-reset');
    }
};

exports.post_new = async function (req, res) {
    const token = req.body.token;
    const userId = req.body.userId;
    const newPassword = req.body.password;
    try {
        const user = await User.findOne({
            where: {
                resetToken: token,
                resetTokenExpiration: { [Op.gt]: Date.now() },
                userId: userId 
            }
        });
        if (!user) {
            req.flash('error', 'Geçersiz veya süresi dolmuş bağlantı!');
            return res.redirect('/auth/login');
        }

        const hashedPassword = await bcrypt.hash(newPassword, 6);
        user.password = hashedPassword;
        user.resetToken = null;
        user.resetTokenExpiration = null;
        await user.save();

        req.flash('success', 'Şifreniz başarıyla sıfırlandı!');
        res.redirect('/auth/login');

    }
    catch (err) {
        console.error(err);
        req.flash('error', 'Şifre sıfırlama sırasında bir hata oluştu.');
        res.redirect('/auth/login');
    }
}
    

exports.get_logout = async function (req, res) {
    try {
        req.session.destroy(err => {
            if (err) {
                console.error(err);
            }
            res.redirect('/auth/login');
        });
    }
    catch (err) {
        console.error(err);
        req.flash('error', 'Çıkış sırasında bir hata oluştu.');
        res.redirect('/auth/login');
    }
};


exports.getRolesPage = async (req, res) => {
    try {
        const users = await User.findAll();

        res.render('auth/roles', {
            title: 'Kullanıcı Rolleri',
            users: users,
           
            csrfToken: req.csrfToken()
        });
    } catch (err) {
        console.error(err);
        req.flash('error', 'Kullanıcı rolleri yüklenirken bir hata oluştu.');
        res.redirect('/');
    }
};

exports.postAssignRole = async (req, res) => {
    const { userId, rolename } = req.body;

    try {
        const user = await User.findByPk(userId);
        if (!user) {
            req.flash('error', 'Kullanıcı bulunamadı.');
            return res.redirect('/auth/roles');
        }

        user.rolename = rolename; // Kullanıcının rolünü güncelle
        await user.save();

        // Eğer oturumdaki kullanıcı güncellenen kullanıcıysa, oturumu da güncelle
        if (req.session.user && req.session.user.userId === userId) {
            req.session.user.rolename = rolename;
        }

        req.flash('success', `${user.fullname} kullanıcısına ${rolename} rolü atandı.`);
        res.redirect('/auth/roles');
    } catch (err) {
        console.error(err);
        req.flash('error', 'Rol atanırken bir hata oluştu.');
        res.redirect('/auth/roles');
    }
};

// Email doğrulama fonksiyonu
exports.verifyEmail = async function (req, res) {
    const token = req.params.token;
    
    try {
        const user = await User.findOne({
            where: {
                emailVerificationToken: token,
                emailVerificationExpires: { [Op.gt]: Date.now() }
            }
        });

        if (!user) {
            logger.warn('Email verification failed - invalid or expired token', { token, ip: req.ip });
            req.flash('error', 'Geçersiz veya süresi dolmuş doğrulama bağlantısı!');
            return res.redirect('/auth/login');
        }

        // Email'i doğrulanmış olarak işaretle
        user.isEmailVerified = true;
        user.emailVerificationToken = null;
        user.emailVerificationExpires = null;
        await user.save();

        logger.info('Email verified successfully', { userId: user.userId, email: user.email });
        console.log('Email doğrulandı:', user.email);

        req.flash('success', 'Email adresiniz başarıyla doğrulandı! Şimdi giriş yapabilirsiniz.');
        res.redirect('/auth/login');
    } catch (err) {
        logger.error('Email verification error', { error: err.message, stack: err.stack, token });
        console.error('Email doğrulama hatası:', err);
        req.flash('error', 'Email doğrulama sırasında bir hata oluştu.');
        res.redirect('/auth/login');
    }
};

// Email doğrulama linkini yeniden gönder
exports.resendVerification = async function (req, res) {
    const { email } = req.body;
    
    try {
        const user = await User.findOne({ where: { email } });
        
        if (!user) {
            req.flash('error', 'Bu email adresi kayıtlı değil!');
            return res.redirect('/auth/resend-verification');
        }
        if (user.isEmailVerified) {
            req.flash('info', 'Bu email adresi zaten doğrulanmış!');
            return res.redirect('/auth/login');
        }
        
        // Yeni token oluştur
        const emailVerificationToken = crypto.randomBytes(32).toString('hex');
        user.emailVerificationToken = emailVerificationToken;
        user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 saat
        await user.save();

        logger.info('Resending verification token updated', { userId: user.userId, email: user.email });

        // --- DEĞİŞTİRME: SMTP göndermeyi kaldır, linki konsola yazdır ---
        try {
            const verificationLink = `http://localhost:${process.env.PORT || 3001}/auth/verify-email/${emailVerificationToken}`;
            console.log('Resent verification link (development):', verificationLink);
            logger.info('Resent verification link (development)', { link: verificationLink, userId: user.userId, email: user.email });
        } catch (err) {
            logger.error('Failed to output resent verification link to console', { error: err.message, stack: err.stack, userId: user.userId });
        }
        // --- /DEĞİŞTİRME ---

        req.flash('success', 'Doğrulama linki konsola yazdırıldı (geliştirme).');
        return res.redirect('/auth/login');
    } catch (err) {
        logger.error('Resend verification error', { error: err.message, stack: err.stack });
        req.flash('error', 'Bir hata oluştu.');
        res.redirect('/auth/resend-verification');
    }
};

exports.getResendVerification = async function (req, res) {
    try {
        res.render('auth/resend-verification', {
            title: 'Email Doğrulama',
            csrfToken: req.csrfToken()
        });
    } catch (err) {
        console.error(err);
        res.redirect('/auth/login');
    }
};
