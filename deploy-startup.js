const { spawn } = require('child_process');
const { logger } = require('./helpers/logger');

// Function to run migration
const runMigration = () => {
    return new Promise((resolve, reject) => {
        const migrate = spawn('npx', ['sequelize-cli', 'db:migrate'], {
            stdio: 'inherit',
            shell: true
        });

        migrate.on('close', (code) => {
            if (code === 0) {
                logger.info('Migration completed successfully');
                resolve();
            } else {
                logger.error(`Migration failed with code ${code}`);
                reject(new Error(`Migration failed with code ${code}`));
            }
        });

        migrate.on('error', (err) => {
            logger.error('Migration process error:', err);
            reject(err);
        });
    });
};

// Function to start the main application
const startApp = () => {
    return new Promise((resolve, reject) => {
        const app = spawn('node', ['index.js'], {
            stdio: 'inherit',
            shell: true
        });

        app.on('close', (code) => {
            logger.info(`App process exited with code ${code}`);
            resolve();
        });

        app.on('error', (err) => {
            logger.error('App process error:', err);
            reject(err);
        });
    });
};

// Main deployment startup sequence
(async () => {
    try {
        logger.info('Starting deployment startup sequence...');
        
        // Run migrations first
        await runMigration();
        
        // Then start the application
        await startApp();
        
    } catch (error) {
        logger.error('Deployment startup failed:', error);
        process.exit(1);
    }
})();
