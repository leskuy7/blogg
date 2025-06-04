const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
const app = express();
const sequelizeStore = require('connect-session-sequelize')(session.Store);
const csurf = require('csurf');
const cookieParser = require('cookie-parser');
const csrfMiddleware = require('./middlewares/csrf'); // CSRF middleware'ini içe aktar
const config = require('./config'); // config dosyasını içe aktar
const { logger, logAccess } = require('./helpers/logger'); // Logger'ı içe aktar

// Environment variables debug
console.log('=== ENVIRONMENT DEBUG ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('=========================');

// Route dosyaları
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');

// Veritabanı modelleri
const { sequelize } = require('./models');

// Middleware dosyası
const { flashMessages, stripTags, currentPath,} = require('./middlewares/all');
const local = require('./middlewares/locals');
const { errorLogger, errorHandler, notFoundHandler } = require('./middlewares/error-handler');
const accessLogger = require('./middlewares/access-logger'); // Access logger'ı ekle
// Seed data
const seedDatabase = require('./helpers/seed-data');

// Session store için Sequelize kullan
const sessionStore = new sequelizeStore({
    db: sequelize,
    tableName: 'Sessions',
    checkExpirationInterval: 15 * 60 * 1000, // 15 dakikada bir süresi dolmuş oturumları temizle
    expiration: 24 * 60 * 60 * 1000 // 24 saat
});

// EJS şablon motorunu kullan
app.set('view engine', 'ejs');

// Statik dosyalar için dizinler
app.use(express.static('public'));
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));
app.use('/cssler', express.static(path.join(__dirname, 'public/css')));
app.use('/resimler', express.static(path.join(__dirname, 'public/images')));
app.use('/jsler', express.static(path.join(__dirname, 'public/js')));

// POST istekleri için URL kodlamasını çöz
app.use(express.urlencoded({ extended: true })); // Form verilerini ayrıştırır
app.use(cookieParser()); // Çerezleri ayrıştırır
app.use(csurf({ cookie: true })); // CSRF middleware
app.use(csrfMiddleware); // CSRF token'ını tüm şablonlarda kullanılabilir yap

// Oturum yönetimi - Database store için
app.use(session({
    secret: config.app.sessionSecret,
    resave: false,
    saveUninitialized: false,
    store: sessionStore, // Database session store
    cookie: { 
        maxAge: 3600000, // 1 saat
        secure: config.app.environment === 'production', // Production ortamında güvenli cookie kullan
        httpOnly: true
    }
}));

// Flash mesajları
app.use(flash());

// Access logger - HTTP isteklerini logla
app.use(accessLogger);

// Middleware'leri kullan
app.use(flashMessages);
app.use(stripTags);
app.use(currentPath);
app.use(local)

// Rota tanımlamaları
app.use('/', userRoutes);
app.use('/admin', adminRoutes);
app.use('/auth', authRoutes);

// Error handling middleware (must be after routes)
app.use(notFoundHandler);
app.use(errorLogger);
app.use(errorHandler);

// Veritabanı senkronizasyonu
const syncDatabase = async () => {
    try {
        // force: false kullanarak mevcut tabloları koru, sadece eksikleri tamamla
        await sequelize.sync({ force: false }); 
        logger.info("Veritabanı tabloları başarıyla senkronize edildi.");
          // Session store'u sync et - artık timestamp kolonları mevcut
        await sessionStore.sync();
        logger.info("Session store başarıyla senkronize edildi.");
        
        // Test verilerini ekle - bu kısmı sadece geliştirme ortamında çalıştırmak için koşul ekleyin
        // process.env.NODE_ENV === 'development' koşulunu ekleyebilirsiniz
        // await seedDatabase();
    } catch (err) {
        logger.error("Veritabanı senkronizasyon hatası:", { error: err.message, stack: err.stack });
    }
};

// Sunucuyu başlat
(async () => {
    await syncDatabase();
    
    const PORT = process.env.PORT || 3000;
    const server = app.listen(PORT, () => {
        logger.info(`Server is running on port ${PORT}`);
    });
    
    server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            logger.error(`Port ${PORT} is already in use. Trying port ${PORT + 1}...`);
            const alternativeServer = app.listen(PORT + 1, () => {
                logger.info(`Server is running on port ${PORT + 1}`);
            });
        } else {
            logger.error('Server error:', { error: err.message, stack: err.stack });
        }
    });
})();