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

const MAX_RETRIES = 5;
const RETRY_DELAY = 5000;

async function waitForDatabase(retries = MAX_RETRIES) {
    for (let i = 0; i < retries; i++) {
        try {
            logger.info(`Database connection attempt ${i + 1}/${retries}`);
            await sequelize.authenticate();
            logger.info('Database connection has been established successfully.');
            return true;
        } catch (error) {
            logger.error('Unable to connect to the database:', error);
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
        
        // Wait for database
        await waitForDatabase();
        
        // Run migrations
        await runMigrations();
        
        // Start the application
        const app = require('./index');
        
    } catch (error) {
        logger.error('Startup failed:', error);
        process.exit(1);
    }
}

// Start the application
startApplication();
