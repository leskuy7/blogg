const mysql = require('mysql2/promise');
const config = require('./config/config.json');

async function fixSessionsTable() {
    console.log('🔧 Sessions tablosu düzeltiliyor...');
    
    try {
        const connection = await mysql.createConnection({
            host: config.development.host,
            user: config.development.username,
            password: config.development.password,
            database: config.development.database
        });

        console.log('✅ Veritabanına bağlandı.');

        // Sessions tablosunu temizle (session verilerini sil)
        console.log('🧹 Eski session verilerini temizleniyor...');
        await connection.execute('DELETE FROM Sessions');
        
        // Sessions tablosunun yapısını kontrol et
        console.log('🔍 Sessions tablosu yapısı kontrol ediliyor...');
        const [columns] = await connection.execute('SHOW COLUMNS FROM Sessions');
        const columnNames = columns.map(col => col.Field);
        
        console.log('Mevcut sütunlar:', columnNames);
        
        // createdAt sütunu varsa sil ve yeniden ekle
        if (columnNames.includes('createdAt')) {
            console.log('🗑️ Eski createdAt sütunu siliniyor...');
            await connection.execute('ALTER TABLE Sessions DROP COLUMN createdAt');
        }
        
        // updatedAt sütunu varsa sil ve yeniden ekle  
        if (columnNames.includes('updatedAt')) {
            console.log('🗑️ Eski updatedAt sütunu siliniyor...');
            await connection.execute('ALTER TABLE Sessions DROP COLUMN updatedAt');
        }
        
        // Yeni timestamp sütunlarını ekle
        console.log('➕ Yeni createdAt sütunu ekleniyor...');
        await connection.execute(`
            ALTER TABLE Sessions 
            ADD COLUMN createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
        `);
        
        console.log('➕ Yeni updatedAt sütunu ekleniyor...');
        await connection.execute(`
            ALTER TABLE Sessions 
            ADD COLUMN updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        `);

        // Son durumu kontrol et
        const [newColumns] = await connection.execute('SHOW COLUMNS FROM Sessions');
        console.log('🎉 Yeni Sessions tablosu yapısı:');
        newColumns.forEach(col => {
            console.log(`  - ${col.Field}: ${col.Type} (${col.Null}, ${col.Default})`);
        });

        await connection.end();
        console.log('\n✅ Sessions tablosu başarıyla düzeltildi!');
        
    } catch (error) {
        console.error('❌ Hata:', error.message);
        process.exit(1);
    }
}

fixSessionsTable();
