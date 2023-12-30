module.exports = (req, res, next) => {
    if (req.session.idx) {
        const error = new Error("already have session");
        error.status = 401;
        next(error);
    } else {
        next();
    }
};
