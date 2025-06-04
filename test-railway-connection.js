// Railway environment variables test
require('dotenv').config();
const { Sequelize } = require('sequelize');

console.log('=== ENVIRONMENT VARIABLES TEST ===\n');

console.log('NODE_ENV:', process.env.NODE_ENV || '❌ NOT SET');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '✅ SET' : '❌ NOT SET');
console.log('SESSION_SECRET:', process.env.SESSION_SECRET ? '✅ SET' : '❌ NOT SET');
console.log('EMAIL_FROM:', process.env.EMAIL_FROM || '❌ NOT SET');

if (!process.env.DATABASE_URL) {
    console.log('\n❌ DATABASE_URL bulunamadı!');
    console.log('Railway → Blog App Service → Variables sekmesinde DATABASE_URL ekleyin');
    process.exit(1);
}

console.log('\n=== DATABASE CONNECTION TEST ===');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    }
});

sequelize.authenticate()
    .then(() => {
        console.log('✅ Database connection BAŞARILI!');
        console.log('🎉 Railway MySQL bağlantısı çalışıyor!');
        return sequelize.close();
    })
    .then(() => {
        console.log('✅ Test tamamlandı');
        process.exit(0);
    })
    .catch(error => {
        console.log('❌ Database connection BAŞARISIZ!');
        console.log('Hata:', error.message);
        console.log('\nMuhtemel sebepler:');
        console.log('1. DATABASE_URL yanlış format');
        console.log('2. MySQL service çalışmıyor');
        console.log('3. Network bağlantısı yok');
        process.exit(1);
    });
