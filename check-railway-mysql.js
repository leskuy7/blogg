// Railway MySQL variable'larını kontrol et
console.log('🔍 Railway MySQL Environment Variables:');
console.log('==========================================');

// Railway'in otomatik olarak sağladığı MySQL variable'ları
const mysqlVars = [
    'MYSQL_URL',
    'MYSQL_PUBLIC_URL', 
    'MYSQL_PRIVATE_URL',
    'MYSQLDATABASE',
    'MYSQLHOST',
    'MYSQLPASSWORD',
    'MYSQLPORT',
    'MYSQLUSER',
    'MYSQL_ROOT_PASSWORD',
    'RAILWAY_PRIVATE_DOMAIN'
];

mysqlVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
        if (varName.includes('PASSWORD')) {
            console.log(`✅ ${varName}: [HIDDEN - ${value.length} chars]`);
        } else {
            console.log(`✅ ${varName}: ${value}`);
        }
    } else {
        console.log(`❌ ${varName}: NOT SET`);
    }
});

console.log('\n🎯 Target Variable:');
console.log('==================');
console.log(`DATABASE_URL: ${process.env.DATABASE_URL || 'NOT SET'}`);

console.log('\n💡 Manual DATABASE_URL Construction:');
console.log('====================================');

if (process.env.MYSQLUSER && process.env.MYSQLPASSWORD && process.env.MYSQLHOST && process.env.MYSQLDATABASE) {
    const constructedUrl = `mysql://${process.env.MYSQLUSER}:${process.env.MYSQLPASSWORD}@${process.env.MYSQLHOST}:${process.env.MYSQLPORT || 3306}/${process.env.MYSQLDATABASE}`;
    console.log('🔧 Constructed DATABASE_URL:');
    console.log(constructedUrl);
} else {
    console.log('❌ Cannot construct DATABASE_URL - missing required variables');
}

process.exit(0);
