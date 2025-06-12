const { Sequelize } = require('sequelize');
require('dotenv').config();

let sequelize = null;

const createConnection = async () => {
    try {
        sequelize = new Sequelize({
            dialect: 'mysql',            host: process.env.MYSQLHOST,
            port: parseInt(process.env.MYSQLPORT),
            username: process.env.MYSQLUSER,
            password: process.env.MYSQLPASSWORD,
            database: process.env.MYSQLDATABASE,
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
            logging: false
        });

        await sequelize.authenticate();
        console.log('Database connection established successfully.');
        return sequelize;
    } catch (error) {
        console.error('Unable to connect to the database:', error);
        process.exit(1);
    }
};

module.exports = sequelize;