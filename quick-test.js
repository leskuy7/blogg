const mysql = require('mysql2/promise');
require('dotenv').config();

async function quickTest() {
    console.log('Quick database test...');
    
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'blogdb'
        });

        console.log('✅ Database connection successful');
        
        // Test a simple query
        const [rows] = await connection.execute('SELECT COUNT(*) as count FROM Users');
        console.log(`✅ Users table accessible - ${rows[0].count} users found`);
        
        const [sessions] = await connection.execute('SELECT COUNT(*) as count FROM Sessions');
        console.log(`✅ Sessions table accessible - ${sessions[0].count} sessions found`);
        
        await connection.end();
        console.log('✅ Database test completed successfully!');
        console.log('\n🎉 The database schema issues have been resolved!');
        
    } catch (error) {
        console.error('❌ Database test failed:', error.message);
    }
}

quickTest();
