const { User, Blog, Category, BlogCategories } = require('../models');
const bcrypt = require('bcrypt');
const { slugField } = require('./slugfield');

async function seedDatabase() {
    try {
        console.log("Örnek veriler yükleniyor...");

        // 1. Örnek Kullanıcılar
        const passwordHash = await bcrypt.hash('123456', 6);

        const adminUser = await User.create({
            fullname: 'Admin Kullanıcı',
            email: 'admin@example.com',
            password: passwordHash,
            rolename: 'admin'
        });

        const moderatorUser = await User.create({
            fullname: 'Moderatör Kullanıcı',
            email: 'moderator@example.com',
            password: passwordHash,
            rolename: 'moderator'
        });

        const guestUser = await User.create({
            fullname: 'Misafir Kullanıcı',
            email: 'guest@example.com',
            password: passwordHash,
            rolename: 'guest'
        });

        // Yeni eklenen örnek kullanıcılar
        const normalUser = await User.create({
            fullname: 'Normal Kullanıcı',
            email: 'user@example.com',
            password: passwordHash,
            rolename: 'user'
        });

        const bloggerUser = await User.create({
            fullname: 'Blog Yazarı',
            email: 'blogger@example.com',
            password: passwordHash,
            rolename: 'user'
        });

        const testUser = await User.create({
            fullname: 'Test Kullanıcı',
            email: 'test@example.com',
            password: passwordHash,
            rolename: 'user'
        });

        const anotherAdmin = await User.create({
            fullname: 'İkinci Admin',
            email: 'admin2@example.com',
            password: passwordHash,
            rolename: 'admin'
        });

        // 2. Örnek Kategoriler
        const technology = await Category.create({
            name: 'Teknoloji',
            slug: 'teknoloji'
        });

        const health = await Category.create({
            name: 'Sağlık',
            slug: 'saglik'
        });

        const travel = await Category.create({
            name: 'Seyahat',
            slug: 'seyahat'
        });

        const education = await Category.create({
            name: 'Eğitim',
            slug: 'egitim'
        });

        const games = await Category.create({
            name: 'Oyunlar',
            slug: 'oyunlar'
        });

        // 3. Örnek Blog Yazıları
        const blog1 = await Blog.create({
            title: 'Teknolojide Son Gelişmeler',
            altbaslik: '2023 yılında teknoloji dünyasındaki önemli gelişmeler',
            content: '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, velit vel bibendum bibendum, nisl nunc bibendum nisl, vel bibendum nisl nisl vel bibendum. Sed euismod, velit vel bibendum bibendum, nisl nunc bibendum nisl, vel bibendum nisl nisl vel bibendum.</p><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, velit vel bibendum bibendum, nisl nunc bibendum nisl, vel bibendum nisl nisl vel bibendum. Sed euismod, velit vel bibendum bibendum, nisl nunc bibendum nisl, vel bibendum nisl nisl vel bibendum.</p>',
            slug: 'teknolojide-son-gelismeler',
            resim: 'default-blog.jpg',
            userId: adminUser.userId,
            anasayfa: true,
            onay: true
        });

        const blog2 = await Blog.create({
            title: 'Sağlıklı Yaşam İçin Beslenme Önerileri',
            altbaslik: 'Günlük hayatta uygulayabileceğiniz beslenme tavsiyeleri',
            content: '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, velit vel bibendum bibendum, nisl nunc bibendum nisl, vel bibendum nisl nisl vel bibendum. Sed euismod, velit vel bibendum bibendum, nisl nunc bibendum nisl, vel bibendum nisl nisl vel bibendum.</p><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, velit vel bibendum bibendum, nisl nunc bibendum nisl, vel bibendum nisl nisl vel bibendum. Sed euismod, velit vel bibendum bibendum, nisl nunc bibendum nisl, vel bibendum nisl nisl vel bibendum.</p>',
            slug: 'saglikli-yasam-icin-beslenme-onerileri',
            resim: 'default-blog.jpg',
            userId: moderatorUser.userId,
            anasayfa: true,
            onay: true
        });

        const blog3 = await Blog.create({
            title: 'İtalya Seyahat Rehberi',
            altbaslik: 'Roma, Venedik ve Floransa\'yı keşfedin',
            content: '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, velit vel bibendum bibendum, nisl nunc bibendum nisl, vel bibendum nisl nisl vel bibendum. Sed euismod, velit vel bibendum bibendum, nisl nunc bibendum nisl, vel bibendum nisl nisl vel bibendum.</p><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, velit vel bibendum bibendum, nisl nunc bibendum nisl, vel bibendum nisl nisl vel bibendum. Sed euismod, velit vel bibendum bibendum, nisl nunc bibendum nisl, vel bibendum nisl nisl vel bibendum.</p>',
            slug: 'italya-seyahat-rehberi',
            resim: 'default-blog.jpg',
            userId: guestUser.userId,
            anasayfa: false,
            onay: true
        });

        const blog4 = await Blog.create({
            title: 'Online Eğitimin Geleceği',
            altbaslik: 'Uzaktan eğitim teknolojileri ve yaklaşımları',
            content: '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, velit vel bibendum bibendum, nisl nunc bibendum nisl, vel bibendum nisl nisl vel bibendum. Sed euismod, velit vel bibendum bibendum, nisl nunc bibendum nisl, vel bibendum nisl nisl vel bibendum.</p><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, velit vel bibendum bibendum, nisl nunc bibendum nisl, vel bibendum nisl nisl vel bibendum. Sed euismod, velit vel bibendum bibendum, nisl nunc bibendum nisl, vel bibendum nisl nisl vel bibendum.</p>',
            slug: 'online-egitimin-gelecegi',
            resim: 'default-blog.jpg',
            userId: adminUser.userId,
            anasayfa: true,
            onay: true
        });

        const blog5 = await Blog.create({
            title: '2023\'ün En İyi Oyunları',
            altbaslik: 'Bu yılın en çok beğenilen video oyunları',
            content: '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, velit vel bibendum bibendum, nisl nunc bibendum nisl, vel bibendum nisl nisl vel bibendum. Sed euismod, velit vel bibendum bibendum, nisl nunc bibendum nisl, vel bibendum nisl nisl vel bibendum.</p><p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed euismod, velit vel bibendum bibendum, nisl nunc bibendum nisl, vel bibendum nisl nisl vel bibendum. Sed euismod, velit vel bibendum bibendum, nisl nunc bibendum nisl, vel bibendum nisl nisl vel bibendum.</p>',
            slug: '2023-en-iyi-oyunlari',
            resim: 'default-blog.jpg',
            userId: moderatorUser.userId,
            anasayfa: false,
            onay: true
        });

        // 4. Blog-Kategori İlişkileri
        await blog1.addCategory(technology);
        await blog2.addCategory(health);
        await blog3.addCategory(travel);
        await blog4.addCategory(education);
        await blog4.addCategory(technology);
        await blog5.addCategory(games);
        await blog5.addCategory(technology);

        console.log("Örnek veriler başarıyla yüklendi.");
    } catch (error) {
        console.error("Seed işlemi sırasında hata oluştu:", error);
    }
}

module.exports = seedDatabase;
