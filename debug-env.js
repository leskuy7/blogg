require('dotenv').config();

console.log('=== ENVIRONMENT VARIABLES DEBUG ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***MASKED***' : 'NOT SET');
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('=====================================');

// Config dosyasını test et
const config = require('./config/config.js');
console.log('=== CONFIG DEBUG ===');
console.log('Production config:', JSON.stringify(config.production, null, 2));
console.log('====================');
