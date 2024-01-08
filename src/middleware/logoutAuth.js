const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    const token = req.cookies?.token;
    const error = new Error("already have token");
    error.status = 401;
    try {
        if (token) {
            throw error;
        }
        console.log(token);
        next();
    } catch (err) {
        next(err);
    }
};
