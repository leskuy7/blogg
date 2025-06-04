// Debug environment variables on Railway
console.log('=== RAILWAY ENVIRONMENT VARIABLES DEBUG ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('');

console.log('=== MYSQL Variables (Railway provided) ===');
console.log('MYSQLUSER:', process.env.MYSQLUSER);
console.log('MYSQLPASSWORD:', process.env.MYSQLPASSWORD ? '[SET]' : '[NOT SET]');
console.log('MYSQLDATABASE:', process.env.MYSQLDATABASE);
console.log('MYSQLHOST:', process.env.MYSQLHOST);
console.log('MYSQLPORT:', process.env.MYSQLPORT);
console.log('');

console.log('=== Custom DB Variables ===');
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '[SET]' : '[NOT SET]');
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT);
console.log('');

console.log('=== Other Variables ===');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? '[SET]' : '[NOT SET]');
console.log('MYSQL_URL:', process.env.MYSQL_URL ? '[SET]' : '[NOT SET]');
console.log('MYSQL_PUBLIC_URL:', process.env.MYSQL_PUBLIC_URL ? '[SET]' : '[NOT SET]');
console.log('');

console.log('=== All Environment Variables ===');
Object.keys(process.env)
  .filter(key => key.includes('MYSQL') || key.includes('DB_') || key.includes('DATABASE'))
  .sort()
  .forEach(key => {
    const value = process.env[key];
    if (value && (key.includes('PASSWORD') || key.includes('SECRET'))) {
      console.log(`${key}=[HIDDEN]`);
    } else {
      console.log(`${key}=${value}`);
    }
  });

console.log('');
console.log('=== Final Config Values ===');
const config = require('./config/config.js');
const prodConfig = config.production;

console.log('Production Config:');
console.log('- username:', prodConfig.username);
console.log('- password:', prodConfig.password ? '[SET]' : '[NOT SET]');
console.log('- database:', prodConfig.database);
console.log('- host:', prodConfig.host);
console.log('- port:', prodConfig.port);
console.log('- dialect:', prodConfig.dialect);

process.exit(0);
