const jwt = require("jsonwebtoken");
const tokenElement = require("../modules/tokenElement");
module.exports = (req, res, next) => {
    const token = req.cookies.token;
    const error = new Error("dont have admin permission");
    error.status = 401;
    try {
        if (!token) {
            throw error;
        }

        jwt.verify(token, process.env.SECRET_KEY);
        if (!tokenElement(token).admin) {
            throw error;
        }
        next();
    } catch (err) {
        if (err.message) {
            err.status = 401;
        }
        next(err);
    }
};
