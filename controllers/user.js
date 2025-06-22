const { Blog, Category } = require('../models');
const { logger, logBusiness } = require('../helpers/logger'); // Logger'ı ekle
const striptags = require('striptags');

exports.getHome = async (req, res) => {
    try {
        logBusiness('info', 'Home page accessed', {
            userId: req.session.user ? req.session.user.userId : null,
            isAuthenticated: !!req.session.isAuth
        });
        const blogs = await Blog.findAll({
            where: { anasayfa: true, onay: true },
            include: [{ 
                model: Category,
                as: 'Categories',
                through: { attributes: [] }
            }]
        });
        const categories = await Category.findAll();
        res.render('users/index', {
            title: "Popüler Kurslar",
            blogs: blogs,
            categories: categories,
            selectedCategory: null,
            activePage: 'home',
            isAuth: req.session.isAuth // Session kullanıldı
        });
    } catch (err) {
        logger.error("Ana sayfa yükleme hatası:", { 
            error: err.message, 
            stack: err.stack,
            userId: req.session.user ? req.session.user.userId : null
        });
        let message = "Bir hata oluştu.";
        if (err instanceof Error) {
            message += err.message;
        }
        res.status(500).send("Bir hata oluştu: " + err.message);
    }
};


exports.getBlogBySlug = async (req, res) => {
    const slug = req.params.slug;
    try {
        logBusiness('info', 'Blog detail page accessed', {
            userId: req.session.user ? req.session.user.userId : null,
            blogSlug: slug,
            isAuthenticated: !!req.session.isAuth
        });

        const blog = await Blog.findOne({
            where: { slug: slug },
            include: [{ 
                model: Category,
                as: 'Categories',
                through: { attributes: [] }
            }]
        });

        if (blog) {
            logBusiness('info', 'Blog view logged', {
                userId: req.session.user ? req.session.user.userId : null,
                blogId: blog.blogId,
                blogTitle: blog.title
            });

            return res.render("users/blog", {
                title: blog.title,
                blog: blog,
                activePage: 'blogs'
            });
        }
        res.redirect('/blogs');

    } catch (err) {
        logger.error("Blog detay sayfası yükleme hatası:", { 
            error: err.message, 
            stack: err.stack,
            blogSlug: slug,
            userId: req.session.user ? req.session.user.userId : null
        });
        res.redirect('/');
    }
};

exports.getAllBlogs = async (req, res) => {
    try {
        const blogs = await Blog.findAll({
            include: [{
                model: Category,
                as: 'Categories',
                through: { attributes: [] }
            }]
        });
        const categories = await Category.findAll();
        res.render('users/blogs', {
            title: "Tüm Bloglar",
            blogs: blogs,
            categories: categories,
            selectedCategory: null,
            totalPages: 1,
            currentPage: 1,
            isAuth: req.session.isAuth
        });
    } catch (err) {
        logger.error("Tüm bloglar yüklenemedi:", { error: err.message, stack: err.stack });
        res.status(500).send("Bir hata oluştu: " + err.message);
    }
};

exports.getBlogsByCategoryWithPagination = async (req, res) => {
    const slug = req.params.slug;
    try {
        logBusiness('info', 'Category blogs page accessed', {
            userId: req.session.user ? req.session.user.userId : null,
            categorySlug: slug,
            page: req.query.page || 1,
            isAuthenticated: !!req.session.isAuth
        });

        const category = await Category.findOne({ where: { slug: slug } });
        if (!category) {
            return res.redirect('/');
        }
        const blogs = await Blog.findAll({
            include: [{
                model: Category,
                as: 'Categories',
                where: { categoryId: category.categoryId },
                through: { attributes: [] }
            }],
            where: { onay: true }
        });
        const categories = await Category.findAll();
        let currentPage = parseInt(req.query.page) || 1;
        let blogsPerPage = 3;
        let totalPages = Math.ceil(blogs.length / blogsPerPage);

        let startIndex = (currentPage - 1) * blogsPerPage;
        let paginatedBlogs = blogs.slice(startIndex, startIndex + blogsPerPage);

        res.render('users/blogs', {
            title: "",
            blogs: paginatedBlogs,
            categories: categories,
            totalPages: totalPages,
            currentPage: currentPage,
            selectedCategory: category.categoryId,
            activePage: 'blogs',            isAuth: req.session.isAuth // Session kullanıldı
        });
    } catch (err) {
        logger.error("Kategori blogları yükleme hatası:", { 
            error: err.message, 
            stack: err.stack,
            categorySlug: slug,
            page: req.query.page,
            userId: req.session.user ? req.session.user.userId : null
        });
        res.status(500).send("Bir hata oluştu: " + err.message);
    }
};