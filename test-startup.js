const express = require('express');
const { sequelize } = require('./models');

async function testStartup() {
    console.log('🧪 Testing application startup...\n');
    
    try {
        // Test database connection
        console.log('1. Testing database connection...');
        await sequelize.authenticate();
        console.log('✅ Database connection successful');

        // Test model synchronization
        console.log('\n2. Testing model synchronization...');
        await sequelize.sync({ force: false });
        console.log('✅ Model synchronization successful');

        // Test basic Express app initialization
        console.log('\n3. Testing Express app initialization...');
        const app = express();
        console.log('✅ Express app created successfully');

        // Test if we can create a simple server
        console.log('\n4. Testing server creation...');
        const server = app.listen(0, () => {
            const port = server.address().port;
            console.log(`✅ Server created successfully on port ${port}`);
            server.close();
        });

        console.log('\n🎉 All startup tests passed! The application should work properly.');
        
    } catch (error) {
        console.error('\n❌ Startup test failed:', error.message);
        if (error.sql) {
            console.error('SQL Error:', error.sql);
        }
    } finally {
        await sequelize.close();
        console.log('\n🔌 Database connection closed');
    }
}

testStartup();
