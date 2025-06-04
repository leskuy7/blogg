const { sequelize } = require('./models');

async function checkAndFixSessions() {
    try {
        console.log('🔍 Checking Sessions table structure...');
        
        // Check if Sessions table exists and get its structure
        const [results] = await sequelize.query("DESCRIBE Sessions");
        console.log('Current Sessions table structure:');
        results.forEach(col => {
            console.log(`- ${col.Field}: ${col.Type} (Null: ${col.Null}, Default: ${col.Default})`);
        });
        
        // Check for timestamp columns
        const hasCreatedAt = results.some(col => col.Field === 'createdAt');
        const hasUpdatedAt = results.some(col => col.Field === 'updatedAt');
        
        console.log(`\nTimestamp columns status:`);
        console.log(`- createdAt: ${hasCreatedAt ? '✅ EXISTS' : '❌ MISSING'}`);
        console.log(`- updatedAt: ${hasUpdatedAt ? '✅ EXISTS' : '❌ MISSING'}`);
        
        if (!hasCreatedAt || !hasUpdatedAt) {
            console.log('\n🚨 Missing timestamp columns detected! This will cause Sequelize errors.');
            console.log('To fix this, run the timestamp migrations or manually add the columns.');
        } else {
            console.log('\n✅ Sessions table has all required timestamp columns!');
        }
        
    } catch (error) {
        console.error('❌ Error checking Sessions table:', error.message);
        if (error.message.includes("doesn't exist")) {
            console.log('💡 Sessions table does not exist. Run migrations to create it.');
        }
    } finally {
        await sequelize.close();
    }
}

checkAndFixSessions();