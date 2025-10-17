const path = require('path');
require('dotenv').config({ path: path.join(__dirname, 'env') });
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const app = express();
const csurf = require('csurf');
const cookieParser = require('cookie-parser');
const { logger } = require('./helpers/logger');
const { sequelize } = require('./models');
const seedDatabase = require('./helpers/seed-data');
const locals = require('./middlewares/locals');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Health check endpoint (DB'ye dokunmadan)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.redirect('/blogs');
});

// Middleware setup
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
// Map legacy image path used in views: /resimler -> /public/images
app.use('/resimler', express.static(path.join(__dirname, 'public', 'images')));
app.use(cookieParser());

// Session setup (MemoryStore for development) - must be before locals and routes
app.use(session({
    secret: process.env.SESSION_SECRET || 'your_secure_session_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        httpOnly: true,
    },
}));

app.use(flash());

// CSRF (after cookie parser, can be before/after session since cookie mode enabled)
app.use(csurf({ cookie: true }));

// Locals (after session so it can read req.session)
app.use(locals);

// Routes
const userRoutes = require('./routes/user');
const adminRoutes = require('./routes/admin');
const authRoutes = require('./routes/auth');

app.use('/', userRoutes);
app.use('/admin', adminRoutes);
app.use('/auth', authRoutes);

// Error handlers
app.use((err, req, res, next) => {
    if (err.code === 'EBADCSRFTOKEN') {
        logger.warn('Invalid CSRF token');
        return res.status(403).send('Geçersiz veya süresi dolmuş form oturumu. Lütfen tekrar deneyin.');
    }
    logger.error('Error:', err);
    res.status(500).send('Internal Server Error');
});

// Start server
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3001;

const startup = async () => {
    try {
        await sequelize.authenticate();
        await sequelize.sync();
        // Seed verisi ekle (dev ortamında otomatik). ENV ile kapatmak için SEED_DB=false ayarlayın.
        if (process.env.SEED_DB !== 'false') {
            try {
                await seedDatabase();
                logger.info('Seed verileri yüklendi (veya zaten mevcut).');
            } catch (seedErr) {
                logger.error('Seed işlemi başarısız oldu', { error: seedErr.message, stack: seedErr.stack });
            }
        }
        logger.info('SQLite database ready');

        app.listen(PORT, () => {
            logger.info(`Server running on port ${PORT}`);
        });
    } catch (error) {
        logger.error('Startup failed:', error);
        process.exit(1);
    }
};

startup();