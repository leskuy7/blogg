const nodemailer = require('nodemailer');
const config = require('../config');

// SMTP configuration (Ethereal by default for dev)
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: false,
    auth: {
        user: (config.email && config.email.user) || process.env.EMAIL_USER || '',
        pass: (config.email && config.email.password) || process.env.EMAIL_PASSWORD || ''
    }
});

module.exports = transporter;