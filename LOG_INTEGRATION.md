# Blog App - Log Kayıtları Entegrasyonu

Bu proje, kapsamlı log kayıtları sistemi ile donatılmıştır. Winston kullanılarak farklı kategorilerde log kayıtları tutulmaktadır.

## Log Dosyaları

Tüm log dosyaları `logs/` klasöründe yer almaktadır:

- **error.log** - Sadece error seviyesindeki loglar
- **combined.log** - Tüm log kayıtları
- **access.log** - HTTP istekleri
- **auth.log** - Kimlik doğrulama işlemleri
- **database.log** - Veritabanı işlemleri

## Log Kategorileri

### 1. Access Logs (Erişim Logları)
HTTP istekleri otomatik olarak loglanır:
```javascript
// Örnek access log
{
  "method": "GET",
  "url": "/admin/blogs",
  "statusCode": 200,
  "responseTime": "45ms",
  "userAgent": "Mozilla/5.0...",
  "ip": "::1",
  "user": "admin@example.com",
  "category": "access"
}
```

### 2. Authentication Logs (Kimlik Doğrulama Logları)
Giriş, kayıt ve şifre sıfırlama işlemleri:
```javascript
// Örnek auth log
logAuth('info', 'User login successful', { 
  userId: 1, 
  email: 'admin@example.com',
  ip: '::1' 
});
```

### 3. Business Logs (İş Mantığı Logları)
Blog oluşturma, kategori işlemleri vb.:
```javascript
// Örnek business log
logBusiness('info', 'Blog created successfully', {
  userId: 1,
  blogId: 5,
  title: 'Yeni Blog Yazısı',
  categoriesCount: 2
});
```

### 4. Security Logs (Güvenlik Logları)
Yetkisiz erişim denemeleri, rol kontrolleri:
```javascript
// Örnek security log
logSecurity('warn', 'Unauthorized access attempt', {
  ip: '::1',
  requestedUrl: '/admin/blogs',
  userRole: 'user'
});
```

### 5. Database Logs (Veritabanı Logları)
Veritabanı bağlantı durumu ve hatalar:
```javascript
// Örnek database log
logDatabase('info', 'Database connection established successfully', {
  database: 'blogapp',
  host: 'localhost',
  dialect: 'sqlite'
});
```

## Entegre Edilen Alanlar

### Controller'larda
- **auth.js** - Giriş, kayıt, şifre sıfırlama işlemleri
- **admin.js** - Blog ve kategori yönetimi işlemleri
- **user.js** - Kullanıcı sayfaları erişimleri

### Middleware'lerde
- **access-logger.js** - HTTP istekleri otomatik loglama
- **error-handler.js** - Hata yakalama ve loglama
- **checkRole.js** - Rol kontrolü ve güvenlik logları
- **rate-limit.js** - Rate limiting ihlalleri
- **all.js** - Kimlik doğrulama kontrolü

### Ana Uygulama
- **index.js** - Sunucu başlatma ve veritabanı bağlantı logları
- **models/index.js** - Veritabanı bağlantı durumu logları

## Log Seviyeleri

1. **error** - Hatalar ve istisnalar
2. **warn** - Uyarılar ve şüpheli aktiviteler
3. **info** - Genel bilgi mesajları
4. **debug** - Geliştirme amaçlı detaylı bilgiler

## Log Rotasyonu

- Her log dosyası maksimum 5MB boyutunda
- 5 adet eski dosya saklanır
- Otomatik rotasyon sistemi aktif

## Kullanım Örnekleri

### Yeni Log Ekleme
```javascript
const { logger, logBusiness } = require('../helpers/logger');

// Basit log
logger.info('Bilgi mesajı');

// Kategorili log
logBusiness('info', 'İş işlemi tamamlandı', {
  userId: 1,
  operationType: 'CREATE',
  details: 'Blog yazısı oluşturuldu'
});
```

### Log Filtreleme
Development ortamında console'da da loglar görüntülenir.
Production ortamında sadece dosyalara yazılır.

## Güvenlik
- Hassas bilgiler (şifreler, tokenlar) loglanmaz
- IP adresleri ve user agent bilgileri güvenlik amaçlı kaydedilir
- Rate limiting ihlalleri otomatik olarak tespit edilir ve loglanır

## Monitöring
Log dosyaları düzenli olarak kontrol edilmeli:
- `error.log` - Hata analizi için
- `auth.log` - Güvenlik incelemesi için
- `access.log` - Performans analizi için
