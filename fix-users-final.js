const mysql = require('mysql2/promise');

// Load environment variables
require('dotenv').config();

async function fixUsersTable() {
    let connection;
    
    try {
        // Create connection
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'blogdb'
        });

        console.log('Connected to database successfully');
        console.log('Fixing Users table...\n');

        // Add emailVerificationExpires column to Users table
        console.log('Adding emailVerificationExpires column to Users table...');
        try {
            await connection.execute(`
                ALTER TABLE users 
                ADD COLUMN emailVerificationExpires DATETIME NULL
            `);
            console.log('✅ emailVerificationExpires column added successfully');
        } catch (error) {
            if (error.message.includes('Duplicate column name')) {
                console.log('✅ emailVerificationExpires column already exists');
            } else {
                console.error('❌ Error adding emailVerificationExpires column:', error.message);
            }
        }

        // Fix the column name mismatch - rename emailVerified to isEmailVerified if needed
        console.log('\nChecking for emailVerified/isEmailVerified column mismatch...');
        const [columns] = await connection.execute('DESCRIBE users');
        const hasEmailVerified = columns.some(col => col.Field === 'emailVerified');
        const hasIsEmailVerified = columns.some(col => col.Field === 'isEmailVerified');
        
        if (hasIsEmailVerified && !hasEmailVerified) {
            console.log('✅ isEmailVerified column exists - this is correct');
        } else if (hasEmailVerified && !hasIsEmailVerified) {
            console.log('Renaming emailVerified to isEmailVerified...');
            try {
                await connection.execute(`
                    ALTER TABLE users 
                    CHANGE COLUMN emailVerified isEmailVerified TINYINT(1) DEFAULT 0
                `);
                console.log('✅ Column renamed to isEmailVerified successfully');
            } catch (error) {
                console.error('❌ Error renaming column:', error.message);
            }
        }

        // Verify the final Users table structure
        console.log('\n=== Final Users Table Structure ===');
        const [finalColumns] = await connection.execute('DESCRIBE users');
        finalColumns.forEach(col => {
            console.log(`  - ${col.Field} (${col.Type}) ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key ? col.Key : ''} ${col.Default !== null ? `DEFAULT ${col.Default}` : ''}`);
        });

        // Check for required columns
        const requiredColumns = ['emailVerificationToken', 'emailVerificationExpires', 'isEmailVerified', 'passwordResetToken', 'passwordResetExpires'];
        console.log('\n=== Required Columns Check ===');
        requiredColumns.forEach(colName => {
            const exists = finalColumns.some(col => col.Field === colName);
            console.log(`  ${colName}: ${exists ? '✅ EXISTS' : '❌ MISSING'}`);
        });

        console.log('\n🎉 Users table fix completed successfully!');

    } catch (error) {
        console.error('❌ Database error:', error.message);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\nDatabase connection closed');
        }
    }
}

fixUsersTable();
