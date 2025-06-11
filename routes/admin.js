const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin');
const { upload } = require('../helpers/image-upload');
const { isAuthenticated } = require('../middlewares/all');
const csrf = require('../middlewares/csrf');
const checkRole = require('../middlewares/checkRole'); 
const { blogValidationRules, categoryValidationRules, validate } = require('../middlewares/validation');

// Önce middleware'i tüm rotalara uygula
router.use(isAuthenticated);

// /admin ana rotası -> /admin/blogs'a yönlendirsin
router.get('/', adminController.getAdminHome);

// Blog listesi sayfasını göster - Admin ve moderator
router.get('/blogs', checkRole(['admin', 'moderator']), adminController.getBlogs);

// Blog oluşturma sayfasını göster - Admin ve moderator
router.get('/blog/create', checkRole(['admin', 'moderator']), csrf, adminController.getCreateBlog);

// Blog oluşturma işlemi - Admin ve moderator
router.post('/blog/create', checkRole(['admin', 'moderator']), csrf, upload.single('resim'), blogValidationRules, validate, adminController.postCreateBlog);

// Blog listesindeki kategori güncelleme işlemi - Admin ve moderator
router.post('/blog/update-category/:blogId', checkRole(['admin', 'moderator']), csrf, adminController.postUpdateBlogCategory);

// Blog düzenleme sayfasını göster - Admin ve moderator
router.get('/blog/edit/:blogId', checkRole(['admin', 'moderator']), csrf, adminController.getEditBlog);

// Blog düzenleme işlemi - Admin ve moderator
router.post('/blog/edit/:blogId', checkRole(['admin', 'moderator']), csrf, upload.single('resim'), blogValidationRules, validate, adminController.postEditBlog);

// Blog silme işlemi - Admin ve moderator
router.get('/blog/delete/:blogId', checkRole(['admin', 'moderator']), adminController.getDeleteBlog);

// Blog slug kontrol işlemi - Admin ve moderator
router.get('/blog/check-slug', checkRole(['admin', 'moderator']), adminController.checkSlug);

// === KATEGORİ İŞLEMLERİ (SADECE ADMIN) ===

// Kategori listesi sayfasını göster - Sadece admin
router.get('/categories', checkRole(['admin']), adminController.getCategories);

// Kategori oluşturma sayfasını göster - Sadece admin
router.get('/category/create', checkRole(['admin']), csrf, adminController.getCreateCategory);

// Kategori oluşturma işlemi - Sadece admin
router.post('/category/create', checkRole(['admin']), csrf, categoryValidationRules, validate, adminController.postCreateCategory);

// Kategori düzenleme işlemi - Sadece admin
router.post('/category/:categoryId', checkRole(['admin']), csrf, categoryValidationRules, validate, adminController.postEditCategory);

// Kategori silme işlemi - Sadece admin
router.get('/category/delete/:categoryId', checkRole(['admin']), adminController.getDeleteCategory);

module.exports = router;