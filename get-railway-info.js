// Railway MySQL bilgilerini öğrenelim
console.log('=== RAILWAY MYSQL SERVICE BİLGİLERİ ===\n');

console.log('Railway Dashboard\'ında MySQL service\'inize gidin:');
console.log('1. Railway.app → Projeniz → MySQL service (kırmızı/turuncu ikon)');
console.log('2. "Variables" sekmesine tıklayın');
console.log('3. Şu değerleri bulun:\n');

console.log('MYSQL_ROOT_PASSWORD = [uzun şifre]');
console.log('RAILWAY_PRIVATE_DOMAIN = [xxx.railway.internal]');
console.log('MYSQL_DATABASE = railway');
console.log('MYSQLUSER = root');
console.log('MYSQLPORT = 3306\n');

console.log('=== DOĞRU DATABASE_URL FORMATINI OLUŞTURUN ===\n');
console.log('mysql://[MYSQLUSER]:[MYSQL_ROOT_PASSWORD]@[RAILWAY_PRIVATE_DOMAIN]:3306/[MYSQL_DATABASE]');
console.log('\nÖrnek:');
console.log('mysql://root:ZkvecwfXEwCTERekcnVgCsqwEFZDmrSb@mysql-production-abc123.railway.internal:3306/railway');
console.log('\n=== BU DEĞERLER HAZIR OLUNCA DEVAM EDİN ===');
