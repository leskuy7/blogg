const { User, Blog, Category } = require('../models');
const bcrypt = require('bcrypt');
const { slugField } = require('./slugfield');

async function seedDatabase() {
    try {
        console.log("Seed: örnek veriler yükleniyor...");

        const passwordHash = await bcrypt.hash('123456', 6);

        // Kullanıcı listesi (email benzersiz)
        const usersToEnsure = [
            { fullname: 'Admin Kullanıcı', email: 'admin@example.com' },
            { fullname: 'Moderatör Kullanıcı', email: 'moderator@example.com' },
            { fullname: 'Misafir Kullanıcı', email: 'guest@example.com' },
            { fullname: 'Normal Kullanıcı', email: 'user@example.com' },
            { fullname: 'Blog Yazarı', email: 'blogger@example.com' },
            { fullname: 'Test Kullanıcı', email: 'test@example.com' },
            { fullname: 'İkinci Admin', email: 'admin2@example.com' },
            { fullname: 'Extra Kullanıcı 1', email: 'extra1@example.com' },
            { fullname: 'Extra Kullanıcı 2', email: 'extra2@example.com' },
            { fullname: 'Extra Kullanıcı 3', email: 'extra3@example.com' }
        ];

        const roles = ['admin', 'moderator', 'user'];

        const createdUsers = [];
        for (const u of usersToEnsure) {
            const [user, created] = await User.findOrCreate({
                where: { email: u.email },
                defaults: {
                    fullname: u.fullname,
                    email: u.email,
                    password: passwordHash,
                    rolename: roles[Math.floor(Math.random() * roles.length)],
                    isEmailVerified: true // örnek veriler için doğrulanmış
                }
            });
            createdUsers.push(user);
            console.log(`Seed: User ${u.email} ${created ? 'oluşturuldu' : 'zaten mevcut'}`);
        }

        // Kategori listesi
        const categoryNames = ['Teknoloji', 'Sağlık', 'Seyahat', 'Eğitim', 'Oyunlar', 'Yemek', 'İş', 'Kültür'];
        const categories = [];
        for (const name of categoryNames) {
            const slug = slugField(name);
            const [cat, created] = await Category.findOrCreate({
                where: { slug },
                defaults: { name, slug }
            });
            categories.push(cat);
            console.log(`Seed: Category ${name} ${created ? 'oluşturuldu' : 'zaten mevcut'}`);
        }

        // Örnek blog listesini genişlet
        const sampleBlogs = [
            {
                title: 'Teknolojide Son Gelişmeler',
                altbaslik: 'Yapay Zeka ve Web Teknolojileri',
                resim: 'https://images.unsplash.com/photo-1677442136019-21780ecad995'
            },
            {
                title: 'Sağlıklı Yaşam İçin Beslenme Önerileri',
                altbaslik: 'Dengeli Beslenme ve Yaşam Tarzı',
                resim: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061'
            },
            {
                title: 'İtalya Seyahat Rehberi',
                altbaslik: 'Roma ve Venedik Gezi Notları',
                resim: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5'
            },
            {
                title: 'Online Eğitimin Geleceği',
                altbaslik: 'Dijital Öğrenme Platformları',
                resim: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8'
            },
            {
                title: '2023\'ün En İyi Oyunları',
                altbaslik: 'Yılın Öne Çıkan Video Oyunları',
                resim: 'https://images.unsplash.com/photo-1538481199705-c710c4e965fc'
            },
            {
                title: 'Evde Yapılabilecek Yemek Tarifleri',
                altbaslik: 'Pratik ve Lezzetli Tarifler',
                resim: 'https://images.unsplash.com/photo-1506368249639-73a05d6f6488'
            },
            {
                title: 'Kariyer Planlama İpuçları',
                altbaslik: 'İş Hayatında Başarı Stratejileri',
                resim: 'https://images.unsplash.com/photo-1521737711867-e3b97375f902'
            },
            {
                title: 'Kültürel Etkinlik Rehberi',
                altbaslik: 'Sanat ve Kültür Etkinlikleri',
                resim: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30'
            },
            {
                title: 'Açık Kaynak Projeler ile Başlamak',
                altbaslik: 'GitHub ve Open Source Rehberi',
                resim: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6'
            },
            {
                title: 'Veri Bilimi Neden Önemli?',
                altbaslik: 'Veri Analizi ve Makine Öğrenmesi',
                resim: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0'
            },
            {
                title: 'Modern Web Tasarım Trendleri',
                altbaslik: '2023 Web Tasarım Yaklaşımları',
                resim: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8'
            },
            {
                title: 'Sürdürülebilir Yaşam Rehberi',
                altbaslik: 'Çevre Dostu Yaşam İpuçları',
                resim: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09'
            },
            {
                title: 'Mobil Fotoğrafçılık İpuçları',
                altbaslik: 'Telefon ile Profesyonel Çekim',
                resim: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32'
            },
            {
                title: 'Minimalist Yaşam Tarzı',
                altbaslik: 'Sade ve Düzenli Bir Hayat',
                resim: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85'
            },
            {
                title: 'Uzaktan Çalışma Rehberi',
                altbaslik: 'Home Office Verimliliği',
                resim: 'https://images.unsplash.com/photo-1585859615972-e736f7cbd0d7'
            }
        ];

        for (let i = 0; i < sampleBlogs.length; i++) {
            const blog = sampleBlogs[i];
            const slug = slugField(blog.title);
            const content = `
                <p>${blog.title} hakkında detaylı bir blog yazısı.</p>
                <h2>Giriş</h2>
                <p>${blog.altbaslik} konusunda derinlemesine bir inceleme.</p>
                <h2>Ana Başlıklar</h2>
                <ul>
                    <li>Önemli nokta 1</li>
                    <li>Dikkat edilmesi gerekenler</li>
                    <li>Püf noktaları</li>
                </ul>
                <p>Bu içerik örnek olarak oluşturulmuştur.</p>
            `;

            // rastgele kullanıcı ata
            const author = createdUsers[Math.floor(Math.random() * createdUsers.length)];
            
            // rastgele 1-3 kategori seç
            const catCount = Math.floor(Math.random() * 3) + 1;
            const chosen = [];
            while (chosen.length < catCount) {
                const c = categories[Math.floor(Math.random() * categories.length)];
                if (!chosen.some(x => x.categoryId === c.categoryId)) chosen.push(c);
            }

            const [blogEntry, created] = await Blog.findOrCreate({
                where: { slug },
                defaults: {
                    title: blog.title,
                    altbaslik: blog.altbaslik,
                    content: content,
                    slug,
                    resim: blog.resim,
                    userId: author.userId,
                    anasayfa: i < 6, // ilk 6'sı anasayfada
                    onay: true
                }
            });

            if (created) {
                const catIds = chosen.map(c => c.categoryId);
                if (catIds.length) await blogEntry.setCategories(catIds);
                console.log(`Seed: Blog "${blog.title}" oluşturuldu (slug: ${slug})`);
            } else {
                console.log(`Seed: Blog "${blog.title}" zaten mevcut, atlanıyor`);
            }
        }

        console.log("Seed işlemi tamamlandı.");
    } catch (error) {
        console.error("Seed işlemi sırasında hata oluştu:", error);
    }
}

module.exports = seedDatabase;
