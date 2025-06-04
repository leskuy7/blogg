// Simple test to verify environment variables and database connection
require('dotenv').config();
const { sequelize } = require('./models');
const { logger } = require('./helpers/logger');

const testConnection = async () => {
    console.log('=== Environment Variables Test ===');
    console.log('NODE_ENV:', process.env.NODE_ENV || 'not set');
    console.log('DB_HOST:', process.env.DB_HOST || 'not set');
    console.log('DB_USER:', process.env.DB_USER || 'not set');
    console.log('DB_NAME:', process.env.DB_NAME || 'not set');
    console.log('DB_PORT:', process.env.DB_PORT || 'not set');
    console.log('PORT:', process.env.PORT || 'not set');
    
    console.log('\n=== Database Connection Test ===');
    try {
        await sequelize.authenticate();
        console.log('✅ Database connection successful!');
        
        console.log('\n=== Database Config Test ===');
        const config = sequelize.config;
        console.log('Host:', config.host);
        console.log('Database:', config.database);
        console.log('Username:', config.username);
        console.log('Dialect:', config.dialect);
        
        await sequelize.close();
        console.log('\n✅ All tests passed!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Database connection failed:', error.message);
        console.error('Error details:', error);
        process.exit(1);
    }
};

testConnection();
