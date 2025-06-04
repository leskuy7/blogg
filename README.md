# Blog Application

Modern bir blog uygulaması. Node.js, Express.js, MySQL ve EJS template engine kullanılarak geliştirilmiştir.

## Özellikler

### 👤 Kullanıcı Yönetimi
- Kullanıcı kaydı ve giriş sistemi
- Email doğrulama
- Şifre sıfırlama
- Kullanıcı rolleri (Admin, User)
- Oturum yönetimi

### 📝 Blog Yönetimi
- Blog yazısı oluşturma, düzenleme, silme
- Kategori sistemi
- Resim yükleme
- SEO dostu URL'ler (slug)
- İçerik sanitization

### 🛡️ Güvenlik
- CSRF koruması
- Rate limiting
- Input validation
- XSS koruması
- SQL injection koruması

### 🎨 Arayüz
- Responsive tasarım
- Bootstrap 5
- Dark/Light mode
- Modern UI/UX

### 📊 Admin Panel
- Kullanıcı yönetimi
- Blog yönetimi
- Kategori yönetimi
- İstatistikler

## Teknolojiler

- **Backend:** Node.js, Express.js
- **Database:** MySQL, Sequelize ORM
- **Template Engine:** EJS
- **CSS Framework:** Bootstrap 5
- **Image Processing:** Sharp
- **Security:** Helmet, CSRF, Rate Limiting
- **Logging:** Winston
- **Email:** Nodemailer

## Kurulum

### Gereksinimler
- Node.js (v14 veya üzeri)
- MySQL (v5.7 veya üzeri)
- npm veya yarn

### Adımlar

1. **Projeyi klonlayın:**
   ```bash
   git clone [repo-url]
   cd blogapp
   ```

2. **Bağımlılıkları yükleyin:**
   ```bash
   npm install
   ```

3. **Environment dosyasını oluşturun:**
   ```bash
   cp .env.example .env
   ```

4. **Environment değişkenlerini düzenleyin:**
   ```
   # Database Configuration
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=blogdb
   DB_PORT=3306

   # Email Configuration
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASSWORD=your_app_password
   EMAIL_FROM=your_email@gmail.com

   # Application Configuration
   SESSION_SECRET=your_secure_session_secret
   NODE_ENV=development
   PORT=3000
   ```

5. **Veritabanını oluşturun:**
   ```sql
   CREATE DATABASE blogdb;
   ```

6. **Uygulamayı başlatın:**
   ```bash
   npm start
   ```

## Kullanım

### Development Modu
```bash
npm run dev
```

### Production Modu
```bash
npm start
```

### Database Migration
```bash
npx sequelize-cli db:migrate
```

## API Endpoints

### Authentication
- `POST /auth/register` - Kullanıcı kaydı
- `POST /auth/login` - Kullanıcı girişi
- `GET /auth/logout` - Çıkış
- `POST /auth/forgot-password` - Şifre sıfırlama

### Blog
- `GET /` - Ana sayfa
- `GET /blogs` - Blog listesi
- `GET /blog/:slug` - Blog detayı

### Admin
- `GET /admin` - Admin paneli
- `GET /admin/blogs` - Blog yönetimi
- `GET /admin/categories` - Kategori yönetimi
- `GET /admin/users` - Kullanıcı yönetimi

## Deployment

### Render.com
1. GitHub reponuzu Render'a bağlayın
2. Environment variables'ları ayarlayın
3. Deploy edin

### Railway
1. Railway'e projeyi import edin
2. Database'i ekleyin
3. Environment variables'ları ayarlayın

## Katkıda Bulunma

1. Fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## İletişim

- Email: [your.email@example.com]
- GitHub: [your-github-username]
