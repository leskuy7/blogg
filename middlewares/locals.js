module.exports = function (req, res, next) {
    res.locals.isAuth = (req.session && req.session.isAuth) || false;
    res.locals.fullname = req.session && req.session.user ? req.session.user.fullname : null;
    res.locals.user = (req.session && req.session.user) || null;
    // Flash messages to templates
    if (req.flash) {
        res.locals.messages = req.flash();
    }
    next();
};