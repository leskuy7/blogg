require('dotenv').config();
const { logger } = require('./helpers/logger');

// Uncaught exception handler
process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception:', error);
    process.exit(1);
});

process.on('unhandledRejection', (error) => {
    logger.error('Unhandled Rejection:', error);
    process.exit(1);
});

// Database ve migration işlemleri için
const { sequelize } = require('./models');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const MAX_RETRIES = 10;  // Retry attempts increased to 10
const RETRY_DELAY = 7000;  // Retry delay increased to 7000ms

async function waitForDatabase(retries = MAX_RETRIES) {
    logger.info('Database connection parameters:', {
        host: process.env.MYSQLHOST,
        port: process.env.MYSQLPORT,
        database: process.env.MYSQLDATABASE,
        user: process.env.MYSQLUSER,
        url: process.env.MYSQL_URL
    });

    logger.info('Retry settings:', {
        maxRetries: MAX_RETRIES,
        retryDelay: RETRY_DELAY
    });

    for (let i = 0; i < retries; i++) {
        try {
            logger.info(`Database connection attempt ${i + 1}/${retries}`);
            
            // Test the connection using netcat first
            await new Promise((resolve, reject) => {
                exec(`nc -zv ${process.env.MYSQLHOST} ${process.env.MYSQLPORT}`, (error, stdout, stderr) => {
                    if (error) {
                        logger.error('Netcat connection test failed:', error);
                        reject(error);
                    } else {
                        logger.info('Netcat connection test successful');
                        resolve();
                    }
                });
            });

            // Then try Sequelize connection
            await sequelize.authenticate();
            logger.info('Database connection has been established successfully.');
            return true;
        } catch (error) {
            logger.error('Unable to connect to the database:', error.message);
            if (i < retries - 1) {
                logger.info(`Retrying in ${RETRY_DELAY/1000} seconds...`);
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
            }
        }
    }
    throw new Error('Failed to connect to database after multiple retries');
}

async function runMigrations() {
    try {
        logger.info('Running database migrations...');
        await execPromise('npx sequelize-cli db:migrate');
        logger.info('Migrations completed successfully');
        
        // Eğer SEED_DATABASE çevre değişkeni true ise
        if (process.env.SEED_DATABASE === 'true') {
            logger.info('Running database seeding...');
            await require('./helpers/seed-data')();
            logger.info('Database seeding completed successfully');
        }
    } catch (error) {
        logger.error('Migration/Seeding failed:', error);
        throw error;
    }
}

async function startApplication() {
    try {
        logger.info('Starting application...');
        
        // Start the application first
        const app = require('./index');
        const PORT = process.env.PORT || 8080;
        
        // Start the server
        const server = app.listen(PORT, () => {
            logger.info(`Server running on port ${PORT}`);
            logger.info(`Environment: ${process.env.NODE_ENV}`);
        });

        // Handle database connection and migrations in the background
        (async () => {
            try {
                // Wait for database
                await waitForDatabase();
                
                // Run migrations
                await runMigrations();
                
                logger.info('Database connection and migrations completed successfully');
            } catch (error) {
                logger.error('Database operations failed:', error);
                // Don't exit the process, just log the error
            }
        })();

        // Graceful shutdown
        process.on('SIGTERM', () => {
            logger.info('SIGTERM signal received');
            server.close(() => {
                logger.info('HTTP server closed');
                process.exit(0);
            });
        });

    } catch (error) {
        logger.error('Startup failed:', error);
        process.exit(1);
    }
}

// Start the application
startApplication();
