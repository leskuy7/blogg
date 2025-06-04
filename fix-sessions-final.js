const mysql = require('mysql2/promise');

// Load environment variables
require('dotenv').config();

async function fixSessionsTable() {
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

        // Add createdAt and updatedAt columns to Sessions table
        console.log('Adding createdAt column to Sessions table...');
        try {
            await connection.execute(`
                ALTER TABLE Sessions 
                ADD COLUMN createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
            `);
            console.log('✓ createdAt column added successfully');
        } catch (error) {
            if (error.message.includes('Duplicate column name')) {
                console.log('✓ createdAt column already exists');
            } else {
                console.error('✗ Error adding createdAt column:', error.message);
            }
        }

        console.log('Adding updatedAt column to Sessions table...');
        try {
            await connection.execute(`
                ALTER TABLE Sessions 
                ADD COLUMN updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            `);
            console.log('✓ updatedAt column added successfully');
        } catch (error) {
            if (error.message.includes('Duplicate column name')) {
                console.log('✓ updatedAt column already exists');
            } else {
                console.error('✗ Error adding updatedAt column:', error.message);
            }
        }

        // Verify the changes
        console.log('\nVerifying Sessions table structure:');
        const [columns] = await connection.execute('DESCRIBE Sessions');
        columns.forEach(col => {
            console.log(`  - ${col.Field} (${col.Type}) ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key ? col.Key : ''} ${col.Default !== null ? `DEFAULT ${col.Default}` : ''}`);
        });

        console.log('\n✅ Sessions table fix completed successfully!');

    } catch (error) {
        console.error('❌ Database error:', error.message);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\nDatabase connection closed');
        }
    }
}

fixSessionsTable();
