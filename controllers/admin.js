const { Blog, Category } = require('../models');
const fs = require('fs');
const path = require('path');
const { Op } = require('sequelize');
const { slugField } = require('../helpers/slugfield'); // Doğru fonksiyonu kullan
const { paginate } = require('../helpers/pagination');
const { logger, logBusiness, logSecurity } = require('../helpers/logger'); // Logger'ı ekle

exports.getAdminHome = (req, res) => {
    res.redirect('/admin/blogs');
};

exports.getBlogs = async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = 8;

    try {
        let where = {};
        
        // Admin olmayan kullanıcılar sadece kendi bloglarını görebilir
        if (req.session.user.rolename !== 'admin') {
            where.userId = req.session.user.userId;
        }

        logBusiness('info', 'Blog list accessed', {
            userId: req.session.user.userId,
            userRole: req.session.user.rolename,
            page,
            isAdmin: req.session.user.rolename === 'admin'
        });

        // Pagination helper kullanarak optimize edilmiş sorgu
        const { rows: blogs, count: totalBlogs, totalPages } = await paginate(
            Blog, 
            page, 
            limit, 
            {
                include: [{
                    model: Category,
                    as: 'Categories',
                    through: { attributes: [] }
                }],
                where: where,
                order: [['blogId', 'DESC']],
                distinct: true
            }
        );

        return res.render('admin/blog-list', {
            title: req.session.user.rolename === 'admin' ? 'Tüm Bloglar' : 'Bloglarım',
            blogs: blogs,
            totalPages,
            currentPage: page,
            totalBlogs,
            userRole: req.session.user.rolename
        });
    } catch (err) {
        logger.error("Blog listesi yüklenirken hata:", { 
            error: err.message, 
            stack: err.stack,
            userId: req.session.user.userId,
            page
        });
        req.flash('error', 'Blogları yüklerken bir hata oluştu: ' + err.message);
        res.redirect('/admin');
    }
};

exports.getCreateBlog = async (req, res) => {
    try {
        const categories = await Category.findAll();
        
        // Get preserved form data from session if exists
        const formData = req.session.formData || {};
        delete req.session.formData; // Clear it after use
        
        res.render('admin/blog-create', {
            title: "Blog Oluştur",
            categories: categories,
            csrfToken: req.csrfToken(),
            formData: formData
        });
    } catch (err) {
        console.error("Blog oluşturma sayfasında hata:", err);
        res.status(500).send("Bir hata oluştu: " + err.message);
    }
};

exports.postCreateBlog = async (req, res) => {
    const { title, altbaslik, content, categoryIds, anasayfa, onay } = req.body;

    logBusiness('info', 'Blog creation attempt', {
        userId: req.session.user.userId,
        userRole: req.session.user.rolename,
        title,
        hasCategories: !!categoryIds
    });

    // Basic validation with detailed checks
    if (!title || title.trim().length === 0) {
        logBusiness('warn', 'Blog creation failed - empty title', {
            userId: req.session.user.userId
        });
        req.flash('error', 'Başlık alanı boş olamaz.');
        req.session.formData = req.body;
        return res.redirect('/admin/blog/create');
    }

    if (!altbaslik || altbaslik.trim().length === 0) {
        req.flash('error', 'Alt başlık alanı boş olamaz.');
        req.session.formData = req.body;
        return res.redirect('/admin/blog/create');
    }

    if (!content || content.trim().length < 10) {
        req.flash('error', 'İçerik en az 10 karakter olmalıdır.');
        req.session.formData = req.body;
        return res.redirect('/admin/blog/create');
    }

    if (!req.file) {
        req.flash('error', 'Lütfen bir resim dosyası yükleyin.');
        req.session.formData = req.body;
        return res.redirect('/admin/blog/create');
    }

    try {
        const slug = slugField(title);
          // Check for existing slug
        const existingSlug = await Blog.findOne({ where: { slug } });
        if (existingSlug) {
            logBusiness('warn', 'Blog creation failed - duplicate slug', {
                userId: req.session.user.userId,
                title,
                slug
            });
            req.flash('error', 'Bu başlıkla daha önce bir blog oluşturulmuş. Lütfen farklı bir başlık deneyin.');
            req.session.formData = req.body;
            return res.redirect('/admin/blog/create');
        }

        const blog = await Blog.create({
            title,
            altbaslik,
            content,
            slug,
            resim: req.file.filename,
            userId: req.session.user.userId,
            anasayfa: anasayfa === 'true' || anasayfa === 'on' ? true : false,
            onay: onay === 'true' || onay === 'on' ? true : false
        });

        // Kategori ilişkisini doğru şekilde ayarla
        if (categoryIds) {
            const categoryIdArray = Array.isArray(categoryIds) ? categoryIds.map(id => parseInt(id)) : [parseInt(categoryIds)];
            await blog.setCategories(categoryIdArray);
        }

        logBusiness('info', 'Blog created successfully', {
            userId: req.session.user.userId,
            blogId: blog.blogId,
            title: blog.title,
            slug: blog.slug,
            categoriesCount: categoryIds ? (Array.isArray(categoryIds) ? categoryIds.length : 1) : 0
        });

        req.flash('success', 'Blog başarıyla oluşturuldu.');
        res.redirect('/admin/blogs');    } catch (err) {
        logger.error("Blog oluşturma hatası:", { 
            error: err.message, 
            stack: err.stack,
            userId: req.session.user.userId,
            title: req.body.title
        });

        const errorMessage = err.name === 'SequelizeUniqueConstraintError' && err.errors[0].path === 'slug'
            ? 'Bu başlıkla daha önce bir blog oluşturulmuş. Lütfen farklı bir başlık deneyin.'
            : 'Bir hata oluştu. Lütfen tekrar deneyin.';

        req.flash('error', errorMessage);
        req.session.formData = req.body;
        res.redirect('/admin/blog/create');
    }
};

exports.postUpdateBlogCategory = async (req, res) => {
    try {
        const { categoryIds } = req.body;
        const { blogId } = req.params;

        const blog = await Blog.findByPk(blogId);
        if (!blog) {
            req.flash('error', 'Blog bulunamadı.');
            return res.redirect('/admin/blogs');
        }

        // Kategori ilişkisini doğru şekilde ayarla - sadece setCategories kullan
        if (categoryIds) {
            const categoryIdArray = Array.isArray(categoryIds) ? categoryIds.map(id => parseInt(id)) : [parseInt(categoryIds)];
            await blog.setCategories(categoryIdArray);
        } else {
            await blog.setCategories([]);
        }

        req.flash('success', 'Blog kategorisi başarıyla güncellendi.');
        res.redirect('/admin/blogs');
    } catch (err) {
        console.error("Blog kategori güncelleme işleminde hata:", err);
        req.flash('error', 'Blog kategori güncelleme işleminde hata oluştu.');
        res.redirect('/admin/blogs');
    }
};

exports.getEditBlog = async (req, res) => {
    try {
        const blogId = req.params.blogId;
        const blog = await Blog.findByPk(blogId, {
            include: [{
                model: Category,
                as: 'Categories',
                through: { attributes: [] }
            }]
        });

        if (!blog) {
            req.flash('error', 'Blog bulunamadı.');
            return res.redirect('/admin/blogs');
        }

        // Admin tüm blogları düzenleyebilir, moderator sadece kendi bloglarını
        if (req.session.user.rolename !== 'admin' && blog.userId !== req.session.user.userId) {
            req.flash('error', 'Bu blogu düzenleme yetkiniz yok.');
            return res.redirect('/admin/blogs');
        }

        const categories = await Category.findAll();

        // Blog verilerini formData olarak doğru formatta hazırla
        const formData = {
            blogId: blog.blogId,
            title: blog.title,
            slug: blog.slug,
            altbaslik: blog.altbaslik,
            content: blog.content,
            resim: blog.resim,
            categoryIds: blog.Categories ? blog.Categories.map(cat => cat.categoryId.toString()) : [],
            anasayfa: blog.anasayfa,
            onay: blog.onay
        };

        res.render('admin/blog-edit', {
            title: 'Blog Düzenle',
            blog: blog,
            categories: categories,
            csrfToken: req.csrfToken(),
            currentPage: req.query.page || 1,
            formData: formData
        });
    } catch (err) {
        console.error("Blog düzenleme sayfasında hata:", err);
        req.flash('error', 'Bir hata oluştu.');
        res.redirect('/admin/blogs');
    }
};

exports.postEditBlog = async (req, res) => {
    try {
        const blogId = req.params.blogId;
        const { title, altbaslik, content, categoryIds, anasayfa, onay, slug, pageNumber } = req.body;

        // Validate content length
        if (!content || content.trim().length < 10) {
            req.flash('error', 'İçerik en az 10 karakter olmalıdır.');
            const blog = await Blog.findByPk(blogId, {
                include: [{
                    model: Category,
                    as: 'Categories',
                    through: { attributes: [] }
                }]
            });
            
            const formData = {
                ...req.body,
                categoryIds: categoryIds || []
            };
            
            const categories = await Category.findAll();
            return res.render('admin/blog-edit', {
                title: 'Blog Düzenle',
                blog: blog,
                categories: categories,
                csrfToken: req.csrfToken(),
                currentPage: pageNumber || 1,
                formData: formData
            });
        }

        const blog = await Blog.findByPk(blogId, {
            include: [{
                model: Category,
                as: 'Categories',
                through: { attributes: [] }
            }]
        });

        // Admin tüm blogları düzenleyebilir, moderator sadece kendi bloglarını
        if (req.session.user.rolename !== 'admin' && blog.userId !== req.session.user.userId) {
            req.flash('error', 'Bu blogu düzenleme yetkiniz yok.');
            return res.redirect('/admin/blogs');
        }

        if (req.file) {
            const newImage = req.file.filename;
            if (blog.resim && blog.resim !== newImage) {
                const oldImagePath = path.join(__dirname, '..', 'public', 'images', blog.resim);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            blog.resim = newImage;
        } else {
            blog.resim = req.body.currentResim;
        }

        blog.title = title;
        blog.content = content;
        blog.altbaslik = altbaslik;
        blog.anasayfa = anasayfa === 'true' || anasayfa === 'on' ? true : false;
        blog.onay = onay === 'true' || onay === 'on' ? true : false;

        if (blog.slug !== slug) {
            const newSlug = slugField(title);
            const existingSlug = await Blog.findOne({ 
                where: { 
                    slug: newSlug,
                    blogId: { [Op.ne]: blogId } 
                } 
            });
            if (existingSlug) {
                req.flash("error", "Aynı ada veya slug'a sahip başka bir blog zaten var.");
                
                const formData = {
                    ...req.body,
                    categoryIds: categoryIds || []
                };
                
                const categories = await Category.findAll();
                return res.render('admin/blog-edit', {
                    title: 'Blog Düzenle',
                    blog: blog,
                    categories: categories,
                    csrfToken: req.csrfToken(),
                    currentPage: pageNumber || 1,
                    formData: formData
                });
            }
            blog.slug = newSlug;
        }

        await blog.save();

        // Kategori ilişkisini doğru şekilde ayarla
        if (req.body.categoryIds) {
            const categoryIdArray = Array.isArray(req.body.categoryIds) 
                ? req.body.categoryIds.map(id => parseInt(id)) 
                : [parseInt(req.body.categoryIds)];
            await blog.setCategories(categoryIdArray);
        } else {
            await blog.setCategories([]);
        }

        req.flash('success', 'Blog başarıyla güncellendi.');
        const currentPage = pageNumber || 1;
        return res.redirect(`/admin/blogs?page=${currentPage}`);
    } catch (err) {
        console.error("Blog düzenleme işleminde hata:", err);
        req.flash('error', 'Blog düzenleme işleminde hata oluştu: ' + err.message);
        res.redirect('/admin/blogs?action=edit&status=error');
    }
};

exports.getDeleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findByPk(req.params.blogId);
        if (!blog) {
            req.flash('error', 'Blog bulunamadı.');
            return res.redirect('/admin/blogs');
        }

        // Admin tüm blogları silebilir, moderator sadece kendi bloglarını
        if (req.session.user.rolename !== 'admin' && blog.userId !== req.session.user.userId) {
            logSecurity('warn', 'Unauthorized blog deletion attempt', {
                userId: req.session.user.userId,
                userRole: req.session.user.rolename,
                targetBlogId: req.params.blogId,
                blogOwnerId: blog.userId
            });
            req.flash('error', 'Bu blogu silme yetkiniz yok.');
            return res.redirect('/admin/blogs');
        }

        logBusiness('info', 'Blog deletion started', {
            userId: req.session.user.userId,
            userRole: req.session.user.rolename,
            blogId: blog.blogId,
            blogTitle: blog.title,
            blogSlug: blog.slug
        });

        if (blog.resim) {
            const oldImagePath = path.join(__dirname, '..', 'public', 'images', blog.resim);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }        await blog.destroy();
        
        logBusiness('info', 'Blog deleted successfully', {
            userId: req.session.user.userId,
            deletedBlogId: req.params.blogId,
            deletedBlogTitle: blog.title
        });
        
        req.flash('success', 'Blog başarıyla silindi.');

        const page = req.query.page || 1;
        return res.redirect(`/admin/blogs?page=${page}&action=delete&status=success`);
    } catch (err) {
        logger.error("Blog silme işleminde hata:", { 
            error: err.message, 
            stack: err.stack,
            userId: req.session.user.userId,
            blogId: req.params.blogId
        });
        req.flash('error', 'Blog silme işleminde hata oluştu.');
        res.redirect('/admin/blogs?action=delete&status=error');
    }
};

exports.getCategories = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 6;
        const offset = (page - 1) * limit;

        const { rows: categories, count } = await Category.findAndCountAll({
            limit: limit,
            offset: offset
        });

        const totalPages = Math.ceil(count / limit) || 1;

        if (page > totalPages) {
            return res.redirect(`/admin/categories?page=${totalPages}`);
        }

        res.render("admin/category-list", {
            title: "Admin Kategori Listesi",
            categories,
            currentPage: page,
            totalPages,
            activePage: 'adminCategories',
            csrfToken: req.csrfToken() // CSRF token ekle
        });
    } catch (err) {
        console.error("Kategori listesinde hata:", err);
        res.status(500).send("Bir hata oluştu: " + err.message);
    }
};

exports.getCreateCategory = async (req, res) => {
    try {
        res.render('admin/category-create', {
            title: "Kategori Oluştur",
            activePage: 'adminCategories',
        });
    } catch (err) {
        console.error("Kategori oluşturma sayfasında hata:", err);
        res.status(500).send("Bir hata oluştu: " + err.message);
    }
};

exports.postCreateCategory = async (req, res) => {
    try {
        const { name } = req.body;

        logBusiness('info', 'Category creation attempt', {
            userId: req.session.user.userId,
            categoryName: name
        });

        const existingCategory = await Category.findOne({ where: { name } });
        if (existingCategory) {
            logBusiness('warn', 'Category creation failed - duplicate name', {
                userId: req.session.user.userId,
                categoryName: name
            });
            req.flash('error', 'Aynı isimde bir kategori zaten mevcut.');
            return res.redirect('/admin/category/create');
        }

        const slug = slugField(name);
        const category = await Category.create({ name, slug });

        logBusiness('info', 'Category created successfully', {
            userId: req.session.user.userId,
            categoryId: category.categoryId,
            categoryName: category.name,
            categorySlug: category.slug
        });

        req.flash('primary', 'Kategori başarıyla oluşturuldu.');
        res.redirect('/admin/categories?action=create&status=success');
    } catch (err) {
        logger.error("Kategori oluşturma işleminde hata:", { 
            error: err.message, 
            stack: err.stack,
            userId: req.session.user.userId,
            categoryName: req.body.name
        });
        req.flash('error', 'Kategori oluşturma işleminde hata oluştu.');
        res.redirect('/admin/category/create?action=create&status=error');
    }
};

exports.postEditCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const { categoryName } = req.body;

        const category = await Category.findByPk(categoryId);
        if (!category) {
            req.flash('error', 'Kategori bulunamadı.');
            return res.redirect('/admin/categories');
        }

        const existingCategory = await Category.findOne({
            where: { name: categoryName, categoryId: { [Op.ne]: categoryId } }
        });
        if (existingCategory) {
            req.flash('error', 'Bu isimde başka bir kategori var.');
            return res.redirect('/admin/categories');
        }

        category.name = categoryName;
        category.slug = slugField(categoryName);
        await category.save();

        req.flash('primary', 'Kategori başarıyla güncellendi.');
        const currentPage = req.query.page || 1;
        res.redirect(`/admin/categories?page=${currentPage}&action=edit&status=success`);
    } catch (err) {
        console.error("Kategori düzenleme işleminde hata:", err);
        req.flash('error', 'Kategori düzenleme işleminde hata oluştu.');
        res.redirect('/admin/categories?action=edit&status=error');
    }
};

exports.getDeleteCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const category = await Category.findByPk(categoryId);
        
        if (!category) {
            req.flash('error', 'Kategori bulunamadı.');
            return res.redirect('/admin/categories');
        }

        logBusiness('info', 'Category deletion started', {
            userId: req.session.user.userId,
            categoryId: category.categoryId,
            categoryName: category.name
        });

        await category.destroy();
        
        logBusiness('info', 'Category deleted successfully', {
            userId: req.session.user.userId,
            deletedCategoryId: categoryId,
            deletedCategoryName: category.name
        });
        
        req.flash('primary', 'Kategori başarıyla silindi.');
        
        const currentPage = req.query.page || 1;
        res.redirect(`/admin/categories?page=${currentPage}&action=delete&status=success`);
    } catch (err) {
        logger.error("Kategori silme işleminde hata:", { 
            error: err.message, 
            stack: err.stack,
            userId: req.session.user.userId,
            categoryId: req.params.categoryId
        });
        req.flash('error', 'Kategori silme işleminde hata oluştu.');
        res.redirect('/admin/categories?action=delete&status=error');
    }
};

exports.checkSlug = async (req, res) => {
    try {
        const { slug } = req.query;
        
        if (!slug) {
            return res.json({ exists: false });
        }

        const existing = await Blog.findOne({
            where: {
                [Op.or]: [
                    { slug },
                    { title: slug }
                ]
            }
        });
        
        return res.json({ exists: !!existing });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
};
