const { Sequelize } = require('sequelize');
require('dotenv').config();

let sequelize = null;
let retryCount = 0;
const MAX_RETRIES = 5;

const createConnection = async () => {
    try {
        sequelize = new Sequelize(
            process.env.DB_NAME || 'railway',
            process.env.DB_USER || 'root',
            process.env.DB_PASSWORD,
            {
                host: process.env.DB_HOST,
                port: parseInt(process.env.DB_PORT || '3306'),
                dialect: 'mysql',
                dialectOptions: {
                    ssl: {
                        rejectUnauthorized: false
                    },
                    connectTimeout: 60000
                },
                pool: {
                    max: 5,
                    min: 0,
                    acquire: 60000,
                    idle: 10000
                },
                retry: {
                    max: 3,
                    timeout: 3000
                },
                logging: false
            }
        );

        await sequelize.authenticate();
        console.log('Database connection established successfully.');
        return sequelize;
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        
        if (retryCount < MAX_RETRIES) {
            retryCount++;
            console.log(`Retrying connection... Attempt ${retryCount}/${MAX_RETRIES}`);
            await new Promise(resolve => setTimeout(resolve, 5000)); // 5 saniye bekle
            return createConnection();
        }
        
        throw new Error(`Failed to connect to database after ${MAX_RETRIES} attempts`);
    }
};

// İlk bağlantıyı oluştur
createConnection().catch(err => {
    console.error('Fatal database connection error:', err);
    process.exit(1); // Kritik hata durumunda uygulamayı sonlandır
});

module.exports = sequelize;