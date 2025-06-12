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

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.send('App is running!');
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

// Start server
const PORT = process.env.PORT || 8080;

const startup = async () => {
    try {
        await sequelize.authenticate();
        logger.info('Database connection established');
        
        if (process.env.NODE_ENV === 'production') {
            await sequelize.sync({ force: false });
            logger.info('Database synced in production mode');
        }
        
        app.set('view engine', 'ejs');
        app.set('views', path.join(__dirname, 'views'));
        
        app.listen(PORT, () => {
            logger.info(`Server running on port ${PORT}`);
            logger.info(`Environment: ${process.env.NODE_ENV}`);
            logger.info(`Database host: ${process.env.MYSQLHOST}`);
            logger.info(`Database port: ${process.env.MYSQLPORT}`);
        });
    } catch (error) {
        logger.error('Startup failed:', error);
        process.exit(1);
    }
};

startup();