module.exports = (req, res, next) => {
    if (!req.session.admin) {
        const error = new Error("dont have admin permission");
        error.status = 401;
        next(error);
    } else {
        next();
    }
};
