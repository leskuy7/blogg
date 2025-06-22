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
        const page = parseInt(req.query.page) || 1;
        const limit = 3;
        const offset = (page - 1) * limit;

        logBusiness('info', 'All blogs page accessed', {
            userId: req.session.user ? req.session.user.userId : null,
            page,
            isAuthenticated: !!req.session.isAuth
        });

        const { count, rows: blogs } = await Blog.findAndCountAll({
            where: { onay: true },
            include: [{
                model: Category,
                as: 'Categories', // Ensure we use the correct association alias
                through: { attributes: [] } // Don't include junction table data
            }],
            limit: limit,
            offset: offset,
            distinct: true, // Important to get correct count with associations
            order: [['blogId', 'DESC']] // Order by most recent
        });

        const categories = await Category.findAll();
        const totalPages = Math.ceil(count / limit) || 1;

        if (page > totalPages) {
            return res.status(404).send("Sayfa bulunamadı.");
        }

        res.render('users/blogs', {
            title: "Blog Listesi",
            blogs: blogs,
            categories: categories,
            totalPages: totalPages,
            currentPage: page,
            selectedCategory: null,
            activePage: 'blogs',
            isAuth: req.session.isAuth,
            stripTags: striptags
        });
    } catch (err) {
        logger.error("Blog listesi yükleme hatası:", { 
            error: err.message, 
            stack: err.stack,
            page: req.query.page,
            userId: req.session.user ? req.session.user.userId : null
        });
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