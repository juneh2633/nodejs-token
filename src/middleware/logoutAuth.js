const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    const token = req.cookies.token;
    const error = new Error("already have token");
    error.status = 401;
    try {
        if (token) {
            jwt.verify(token, process.env.SECRET_KEY);

            throw error;
        }

        next();
    } catch (err) {
        if (err.message === "jwt expired") {
            res.clearCookie("token");
            next();
        } else {
            next(err);
        }
    }
};
