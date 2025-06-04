const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkUsersTable() {
    let connection;
    
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'blogdb'
        });

        console.log('🔍 Checking Users table structure...\n');

        const [columns] = await connection.execute('DESCRIBE Users');
        console.log('Current Users table columns:');
        columns.forEach(col => {
            console.log(`- ${col.Field} (${col.Type}) ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Default !== null ? `DEFAULT ${col.Default}` : ''}`);
        });

        // Check for missing email verification columns
        const hasEmailVerified = columns.some(col => col.Field === 'isEmailVerified');
        const hasEmailVerificationToken = columns.some(col => col.Field === 'emailVerificationToken');
        const hasEmailVerificationExpires = columns.some(col => col.Field === 'emailVerificationExpires');

        console.log('\nEmail verification columns status:');
        console.log(`- isEmailVerified: ${hasEmailVerified ? '✅ EXISTS' : '❌ MISSING'}`);
        console.log(`- emailVerificationToken: ${hasEmailVerificationToken ? '✅ EXISTS' : '❌ MISSING'}`);
        console.log(`- emailVerificationExpires: ${hasEmailVerificationExpires ? '✅ EXISTS' : '❌ MISSING'}`);

        if (!hasEmailVerificationExpires) {
            console.log('\n🚨 emailVerificationExpires column is missing! This is causing the error.');
        }

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

checkUsersTable();
