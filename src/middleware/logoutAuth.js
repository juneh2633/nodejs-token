const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    const accessToken = req.cookies.accessToken;
    const error = new Error("already have token");
    error.status = 401;
    try {
        if (accessToken) {
            jwt.verify(accessToken, process.env.SECRET_KEY);

            throw error;
        }

        next();
    } catch (err) {
        if (err.message === "jwt expired") {
            res.clearCookie("accessToken");
            next();
        } else {
            next(err);
        }
    }
};
//jwt must be provided
