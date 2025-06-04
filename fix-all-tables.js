const mysql = require('mysql2/promise');
const config = require('./config/config.json');

async function checkAndFixDatabase() {
    console.log('🔍 Veritabanı yapısı kontrol ediliyor...');
    
    try {
        const connection = await mysql.createConnection({
            host: config.development.host,
            user: config.development.username,
            password: config.development.password,
            database: config.development.database
        });

        console.log('✅ Veritabanına bağlandı.');

        // Tüm tabloları listele
        const [tables] = await connection.execute('SHOW TABLES');
        console.log('\n📋 Mevcut tablolar:');
        tables.forEach(table => {
            const tableName = Object.values(table)[0];
            console.log(`  - ${tableName}`);
        });

        // Her tablo için sütunları kontrol et ve eksik timestamp sütunlarını ekle
        for (const table of tables) {
            const tableName = Object.values(table)[0];
            console.log(`\n🔧 ${tableName} tablosu kontrol ediliyor...`);
            
            const [columns] = await connection.execute(`SHOW COLUMNS FROM ${tableName}`);
            const columnNames = columns.map(col => col.Field);
            
            let hasCreatedAt = columnNames.includes('createdAt');
            let hasUpdatedAt = columnNames.includes('updatedAt');
            
            console.log(`   Mevcut sütunlar: ${columnNames.join(', ')}`);
            console.log(`   createdAt: ${hasCreatedAt ? '✅' : '❌'}, updatedAt: ${hasUpdatedAt ? '✅' : '❌'}`);
            
            // createdAt sütunu ekle
            if (!hasCreatedAt) {
                console.log(`   🔨 ${tableName} tablosuna createdAt ekleniyor...`);
                await connection.execute(`
                    ALTER TABLE ${tableName} 
                    ADD COLUMN createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
                `);
                console.log(`   ✅ createdAt eklendi`);
            }
            
            // updatedAt sütunu ekle
            if (!hasUpdatedAt) {
                console.log(`   🔨 ${tableName} tablosuna updatedAt ekleniyor...`);
                await connection.execute(`
                    ALTER TABLE ${tableName} 
                    ADD COLUMN updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                `);
                console.log(`   ✅ updatedAt eklendi`);
            }
            
            if (hasCreatedAt && hasUpdatedAt) {
                console.log(`   ✅ ${tableName} tamam`);
            }
        }

        await connection.end();
        console.log('\n🎉 Veritabanı düzeltme işlemi tamamlandı!');
        console.log('Şimdi uygulamayı yeniden başlatın.');
        
    } catch (error) {
        console.error('❌ Hata:', error.message);
        process.exit(1);
    }
}

checkAndFixDatabase();
