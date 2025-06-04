// Test DATABASE_URL connection method
require('dotenv').config();
const { Sequelize } = require('sequelize');

console.log('=== Testing DATABASE_URL Connection Method ===');
console.log('NODE_ENV:', process.env.NODE_ENV || 'not set');
console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);

// Test with DATABASE_URL method (like production)
if (process.env.DATABASE_URL) {
    console.log('\n=== Testing with DATABASE_URL ===');
    const sequelize = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'mysql',
        logging: console.log,
        dialectOptions: {
            ssl: {
                require: true,
                rejectUnauthorized: false
            }
        }
    });

    sequelize.authenticate()
        .then(() => {
            console.log('✅ DATABASE_URL connection successful!');
            return sequelize.close();
        })
        .then(() => {
            console.log('✅ Connection closed successfully');
            process.exit(0);
        })
        .catch(error => {
            console.error('❌ DATABASE_URL connection failed:', error.message);
            process.exit(1);
        });
} else {
    console.log('⚠️ DATABASE_URL not found, using individual connection parameters');
    
    // Fallback to individual parameters
    const sequelize = new Sequelize({
        username: process.env.DB_USER || "root",
        password: process.env.DB_PASSWORD || "",
        database: process.env.DB_NAME || "blogdb",
        host: process.env.DB_HOST || "localhost",
        port: parseInt(process.env.DB_PORT) || 3306,
        dialect: "mysql",
        logging: console.log
    });

    sequelize.authenticate()
        .then(() => {
            console.log('✅ Individual parameters connection successful!');
            return sequelize.close();
        })
        .then(() => {
            console.log('✅ Connection closed successfully');
            process.exit(0);
        })
        .catch(error => {
            console.error('❌ Individual parameters connection failed:', error.message);
            process.exit(1);
        });
}
