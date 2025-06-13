require('dotenv').config();
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const path = require('path');
const app = express();
const sequelizeStore = require('connect-session-sequelize')(session.Store);
const csurf = require('csurf');
const cookieParser = require('cookie-parser');
const { logger } = require('./helpers/logger');
const config = require('./config');
const { sequelize } = require('./models');
const { flashMessages, stripTags, currentPath } = require('./middlewares/all');
const locals = require('./middlewares/locals');

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Health check with database verification
app.get('/health', async (req, res) => {
    try {
        logger.info('Health check initiated');
        const dbStatus = await sequelize.authenticate();
        logger.info('Database connection successful during health check');
        res.json({ status: 'ok', message: 'Service is healthy', dbStatus });
    } catch (error) {
        logger.error('Health check failed:', error);
        res.status(503).json({ 
            status: 'error', 
            message: 'Database connection failed',
            error: error.message 
        });
    }
});

// Root endpoint
app.get('/', (req, res) => {
  res.send('App is running!');
});

// Middleware setup
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(cookieParser());
app.use(csurf({ cookie: true }));

// Session setup
const sessionStore = new sequelizeStore({
    db: sequelize,
    tableName: 'Sessions'
});

app.use(session({
    secret: process.env.SESSION_SECRET || 'your_secure_session_secret',
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true
    }
}));

app.use(flash());
app.use(flashMessages);
app.use(stripTags);
app.use(currentPath);
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
    logger.error('Error:', err);
    res.status(500).send('Internal Server Error');
});

// Export the app for deploy-startup.js to use
module.exports = app;