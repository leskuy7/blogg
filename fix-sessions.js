const { sequelize } = require('./models');

async function fixSessionsTable() {
    try {
        console.log('🔧 Sessions tablosu düzeltiliyor...');
        
        // Sessions tablosunun mevcut yapısını kontrol et
        console.log('📋 Mevcut Sessions tablosu yapısı:');
        const [results] = await sequelize.query("DESCRIBE Sessions");
        console.table(results);
        
        // createdAt sütunu var mı kontrol et
        const hasCreatedAt = results.some(col => col.Field === 'createdAt');
        const hasUpdatedAt = results.some(col => col.Field === 'updatedAt');
        
        // createdAt sütunu yoksa ekle
        if (!hasCreatedAt) {
            console.log('➕ Sessions tablosuna createdAt sütunu ekleniyor...');
            await sequelize.query(`
                ALTER TABLE Sessions 
                ADD COLUMN createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            `);
            console.log('✅ createdAt sütunu eklendi');
        } else {
            console.log('✅ createdAt sütunu zaten mevcut');
        }
        
        // updatedAt sütunu yoksa ekle
        if (!hasUpdatedAt) {
            console.log('➕ Sessions tablosuna updatedAt sütunu ekleniyor...');
            await sequelize.query(`
                ALTER TABLE Sessions 
                ADD COLUMN updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            `);
            console.log('✅ updatedAt sütunu eklendi');
        } else {
            console.log('✅ updatedAt sütunu zaten mevcut');
        }
        
        // Güncellenmiş tablo yapısını göster
        console.log('\n📋 Güncellenmiş Sessions tablosu yapısı:');
        const [newResults] = await sequelize.query("DESCRIBE Sessions");
        console.table(newResults);
        
        console.log('\n🎉 Sessions tablosu başarıyla düzeltildi!');
        console.log('Artık uygulamayı yeniden başlatabilirsiniz.');
        
    } catch (error) {
        console.error('❌ Sessions tablosu düzeltme hatası:', error.message);
        console.error(error.stack);
    } finally {
        await sequelize.close();
        process.exit(0);
    }
}

fixSessionsTable();
