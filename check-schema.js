const mysql = require('mysql2/promise');
const path = require('path');

// Load environment variables
require('dotenv').config();

async function checkSchema() {
    let connection;
    
    try {        // Create connection
        connection = await mysql.createConnection({
            host: process.env.DB_HOST || 'localhost',
            user: process.env.DB_USER || 'root',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'blogdb'
        });

        console.log('Connected to database successfully');

        // Check all tables and their columns
        const tables = ['Blogs', 'Users', 'Categories', 'Sessions'];
        
        for (const table of tables) {
            console.log(`\n=== Checking table: ${table} ===`);
            
            try {
                const [columns] = await connection.execute(`DESCRIBE ${table}`);
                console.log('Current columns:');
                columns.forEach(col => {
                    console.log(`  - ${col.Field} (${col.Type}) ${col.Null === 'NO' ? 'NOT NULL' : 'NULL'} ${col.Key ? col.Key : ''} ${col.Default !== null ? `DEFAULT ${col.Default}` : ''}`);
                });
                
                // Check if createdAt and updatedAt exist
                const hasCreatedAt = columns.some(col => col.Field === 'createdAt');
                const hasUpdatedAt = columns.some(col => col.Field === 'updatedAt');
                
                console.log(`  createdAt exists: ${hasCreatedAt}`);
                console.log(`  updatedAt exists: ${hasUpdatedAt}`);
                
            } catch (error) {
                console.log(`  Error checking table ${table}: ${error.message}`);
            }
        }

    } catch (error) {
        console.error('Database connection error:', error.message);
    } finally {
        if (connection) {
            await connection.end();
            console.log('\nDatabase connection closed');
        }
    }
}

checkSchema();
