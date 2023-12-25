module.exports = (req, res, next) => {
    if (req.session.userId) {
        const error = new Error("already have session");
        error.status = 401;
        next(error);
    } else {
        next();
    }
};
