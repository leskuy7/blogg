const nodemailer = require('nodemailer');
const config = require('../config');

// Ethereal SMTP yapılandırması
const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false, // TLS kullanımı için false
    auth: {
        user: config.auth.user, // Ethereal kullanıcı adı
        pass: config.auth.pass  // Ethereal şifre
    }
});

module.exports = transporter;