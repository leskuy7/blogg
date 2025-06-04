const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixEmailVerificationColumns() {
    let connection;
    
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'blogdb'
        });

        console.log('🔧 Fixing Users table email verification columns...\n');

        // Add emailVerificationExpires column if missing
        console.log('Adding emailVerificationExpires column...');
        try {
            await connection.execute(`
                ALTER TABLE Users 
                ADD COLUMN emailVerificationExpires DATETIME NULL
            `);
            console.log('✅ emailVerificationExpires column added successfully');
        } catch (error) {
            if (error.message.includes('Duplicate column name')) {
                console.log('✅ emailVerificationExpires column already exists');
            } else {
                console.error('❌ Error adding emailVerificationExpires:', error.message);
            }
        }

        // Verify the structure
        console.log('\n🔍 Verifying Users table structure...');
        const [columns] = await connection.execute('DESCRIBE Users');
        
        const emailVerificationColumns = columns.filter(col => 
            col.Field.includes('emailVerification') || col.Field === 'isEmailVerified'
        );
        
        console.log('Email verification related columns:');
        emailVerificationColumns.forEach(col => {
            console.log(`✅ ${col.Field} (${col.Type}) ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
        });

        console.log('\n🎉 Users table email verification columns fixed!');

    } catch (error) {
        console.error('❌ Database error:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

fixEmailVerificationColumns();
