require('dotenv').config();
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
const syncDatabase = async (retries = 3) => {
    for (let i = 0; i < retries; i++) {
        try {
            logger.info(`Database connection attempt ${i + 1}/${retries}`);
            
            // Test database connection first with timeout
            await sequelize.authenticate();
            logger.info("Veritabanı bağlantısı başarılı.");
            
            // In production, use alter instead of sync for better compatibility
            if (process.env.NODE_ENV === 'production') {
                // Just ensure tables exist, don't alter structure
                await sequelize.sync({ alter: false, force: false });
            } else {
                // force: false kullanarak mevcut tabloları koru, sadece eksikleri tamamla
                await sequelize.sync({ force: false }); 
            }
            logger.info("Veritabanı tabloları başarıyla senkronize edildi.");
            
            // Session store'u sync et - artık timestamp kolonları mevcut
            await sessionStore.sync();
            logger.info("Session store başarıyla senkronize edildi.");
            
            return; // Success, exit retry loop
            
        } catch (err) {
            logger.error(`Database sync attempt ${i + 1} failed:`, { error: err.message });
            
            if (i === retries - 1) {
                logger.error("All database connection attempts failed:", { error: err.message, stack: err.stack });
                throw err; // Re-throw to prevent server from starting with broken DB
            }
            
            // Wait before retry
            await new Promise(resolve => setTimeout(resolve, 5000 * (i + 1)));
        }
    }
};

const startup = require('./deploy-startup');

// Sunucuyu başlat
(async () => {
    try {
        if (process.env.NODE_ENV === 'production') {
            await startup();
        } else {
            await syncDatabase();
        }
        
        const PORT = process.env.PORT || 3000;
        const server = app.listen(PORT, () => {
            logger.info(`Server is running on port ${PORT}`);
            logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
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
    } catch (error) {
        logger.error('Failed to start server:', { error: error.message, stack: error.stack });
        process.exit(1);
    }
})();

// Uncaught error handler
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    // Kritik hatada temiz bir şekilde kapat
    process.exit(1);
});

process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    // Kritik hatada temiz bir şekilde kapat
    process.exit(1);
});

// Database bağlantısını bekle
const sequelize = require('./data/db');
let server;

const startServer = async () => {
    try {
        // Veritabanı bağlantısını kontrol et
        await sequelize.authenticate();
        console.log('Database connection is ready');

        // ...existing middleware setups...

        const PORT = process.env.PORT || 3000;
        server = app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });

        // Graceful shutdown
        process.on('SIGTERM', () => {
            console.log('SIGTERM received. Shutting down gracefully...');
            shutdown();
        });

        process.on('SIGINT', () => {
            console.log('SIGINT received. Shutting down gracefully...');
            shutdown();
        });

    } catch (error) {
        console.error('Unable to start server:', error);
        process.exit(1);
    }
};

const shutdown = async () => {
    try {
        console.log('Starting graceful shutdown...');
        
        // HTTP sunucusunu kapat
        if (server) {
            await new Promise((resolve) => {
                server.close(resolve);
            });
            console.log('HTTP server closed');
        }

        // Veritabanı bağlantısını kapat
        await sequelize.close();
        console.log('Database connection closed');

        process.exit(0);
    } catch (err) {
        console.error('Error during shutdown:', err);
        process.exit(1);
    }
};

startServer();