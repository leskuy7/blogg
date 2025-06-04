const mysql = require('mysql2/promise');
require('dotenv').config();

async function fixEmailVerificationFinal() {
    let connection;
    
    try {
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'blogdb'
        });

        console.log('Fixing email verification columns...');

        // First, let's see what columns exist
        const [currentCols] = await connection.execute('DESCRIBE Users');
        const columnNames = currentCols.map(col => col.Field);
        
        console.log('Current columns:', columnNames.join(', '));

        // Add missing columns one by one
        const columnsToAdd = [
            {
                name: 'emailVerificationExpires',
                sql: 'ALTER TABLE Users ADD COLUMN emailVerificationExpires DATETIME NULL'
            },
            {
                name: 'emailVerified',
                sql: 'ALTER TABLE Users ADD COLUMN emailVerified TINYINT(1) DEFAULT 0'
            }
        ];

        for (const col of columnsToAdd) {
            if (!columnNames.includes(col.name)) {
                try {
                    await connection.execute(col.sql);
                    console.log(`✅ Added ${col.name}`);
                } catch (error) {
                    console.log(`❌ Error adding ${col.name}:`, error.message);
                }
            } else {
                console.log(`✅ ${col.name} already exists`);
            }
        }

        // Verify final structure
        const [finalCols] = await connection.execute('DESCRIBE Users');
        console.log('\nFinal Users table columns:');
        finalCols.forEach(col => {
            if (col.Field.includes('email') || col.Field.includes('Email')) {
                console.log(`- ${col.Field} (${col.Type})`);
            }
        });

        console.log('\n✅ Email verification columns fix completed!');

    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

// Run directly
fixEmailVerificationFinal().then(() => {
    console.log('Script completed');
    process.exit(0);
}).catch(err => {
    console.error('Script failed:', err.message);
    process.exit(1);
});
