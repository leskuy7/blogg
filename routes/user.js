const express = require('express'); 
const router = express.Router();    
const userController = require('../controllers/user');

// Ana sayfa rotası
router.get('/', userController.getHome);

// Tüm blogları listeleme rotası (daha spesifik rota önce gelsin)
router.get('/blogs', userController.getAllBlogs);

// Kategoriye göre blogları listeleme rotası (slug parametreli rota)
router.get('/blogs/category/:slug', userController.getBlogsByCategoryWithPagination);

// Tek bir blogu görüntüleme rotası (en son çünkü catch-all davranır)
router.get("/blogs/:slug", userController.getBlogBySlug);

module.exports = router;