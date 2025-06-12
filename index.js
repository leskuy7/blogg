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

// Health check route with database check and environment validation
app.get('/health', async (req, res) => {
    const checkResult = {
        status: 'ok',
        timestamp: new Date(),
        checks: {
            environment: {
                status: 'ok',
                missing: []
            },
            database: {
                status: 'pending'
            },
            system: {
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                nodeVersion: process.version
            }
        }
    };

    // Check required environment variables - accept either Railway or custom vars
    const requiredEnvVars = [
        ['MYSQLHOST', 'DB_HOST'],
        ['MYSQLPORT', 'DB_PORT'],
        ['MYSQLUSER', 'DB_USER'],
        ['MYSQLPASSWORD', 'DB_PASSWORD'],
        ['MYSQLDATABASE', 'DB_NAME']
    ];

    const missingEnvVars = requiredEnvVars.filter(([railway, custom]) => 
        !process.env[railway] && !process.env[custom]
    ).map(([railway]) => railway);
    
    if (missingEnvVars.length > 0) {
        checkResult.checks.environment.status = 'error';
        checkResult.checks.environment.missing = missingEnvVars;
        checkResult.status = 'error';
        return res.status(503).json(checkResult);
    }    // Check database connection with timeout
    try {
        const dbCheckPromise = sequelize.authenticate();
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Database connection timeout')), 5000)
        );
        
        await Promise.race([dbCheckPromise, timeoutPromise]);
        
        checkResult.checks.database = {
            status: 'ok',
            host: process.env.MYSQLHOST,
            port: process.env.MYSQLPORT,
            database: process.env.MYSQLDATABASE,
            connectionTime: new Date().toISOString()
        };
    } catch (error) {
        checkResult.status = 'error';
        checkResult.checks.database = {
            status: 'error',
            message: error.message,
            errorType: error.name,
            host: process.env.MYSQLHOST,
            port: process.env.MYSQLPORT,
            database: process.env.MYSQLDATABASE,
            timestamp: new Date().toISOString()
        };
        return res.status(503).json(checkResult);
    }

    res.status(200).json(checkResult);
});

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

// Startup process
const startup = async () => {
    try {
        const PORT = process.env.PORT || 8080;
        
        // Add quick health route for initial check
        app.get('/', (req, res) => {
            res.send('OK');
        });

        // Check database connection
        await sequelize.authenticate();
        logger.info('Database connection established');
        
        // Sync database in production without force
        if (process.env.NODE_ENV === 'production') {
            await sequelize.sync({ force: false });
            logger.info('Database synced in production mode');
        }
        
        // Start server
        app.listen(PORT, () => {
            logger.info(`Server running on port ${PORT}`);
            logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
            logger.info(`Database host: ${process.env.MYSQLHOST}`);
            logger.info(`Database port: ${process.env.MYSQLPORT}`);
        });
    } catch (error) {
        logger.error('Startup failed:', error);
        process.exit(1);
    }
};

// Handle uncaught errors
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (error) => {
    logger.error('Unhandled Rejection:', error);
    process.exit(1);
});

// Start the application
startup();