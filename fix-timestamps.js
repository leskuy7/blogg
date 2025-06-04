const { sequelize } = require('./models');

async function addTimestamps() {
    try {
        console.log('Adding timestamps to tables...');
        
        // Blogs tablosuna timestamp kolonları ekle
        try {
            await sequelize.query(`
                ALTER TABLE blogs 
                ADD COLUMN createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                ADD COLUMN updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            `);
            console.log('✅ Timestamps added to blogs table');
        } catch (err) {
            console.log('⚠️  Blogs timestamps already exist or error:', err.message);
        }
        
        // Users tablosuna timestamp kolonları ekle
        try {
            await sequelize.query(`
                ALTER TABLE users 
                ADD COLUMN createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                ADD COLUMN updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            `);
            console.log('✅ Timestamps added to users table');
        } catch (err) {
            console.log('⚠️  Users timestamps already exist or error:', err.message);
        }
        
        // Categories tablosuna timestamp kolonları ekle
        try {
            await sequelize.query(`
                ALTER TABLE categories 
                ADD COLUMN createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                ADD COLUMN updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            `);
            console.log('✅ Timestamps added to categories table');
        } catch (err) {
            console.log('⚠️  Categories timestamps already exist or error:', err.message);
        }
        
        // BlogCategories tablosuna timestamp kolonları ekle
        try {
            await sequelize.query(`
                ALTER TABLE BlogCategories 
                ADD COLUMN createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                ADD COLUMN updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            `);
            console.log('✅ Timestamps added to BlogCategories table');
        } catch (err) {
            console.log('⚠️  BlogCategories timestamps already exist or error:', err.message);
        }
        
        console.log('🎉 Database schema update completed!');
        console.log('Now restart the application to test...');
        
    } catch (error) {
        console.error('❌ Error updating database schema:', error.message);
    } finally {
        await sequelize.close();
    }
}

addTimestamps();
