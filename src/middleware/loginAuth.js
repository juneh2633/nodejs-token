module.exports = (req, res, next) => {
    if (req.session.userId) {
        next();
    } else {
        const error = new Error("dont have session");
        error.status = 401;
        next(error);
    }
};
