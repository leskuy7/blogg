module.exports = function (req, res, next) {
    res.locals.isAuth = req.session.isAuth || false;
    res.locals.fullname = req.session.user ? req.session.user.fullname : null; // Kullanıcı adı oturumdan alınır
    res.locals.user = req.session.user || null; // Tüm kullanıcı nesnesini şablona ekle
    next();
};