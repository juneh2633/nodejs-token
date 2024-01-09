const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    const token = req.cookies.token;
    try {
        if (!token) {
            throw new Error("no token");
        }

        const verify = jwt.verify(token, process.env.SECRET_KEY);
        console.log(verify);
        next();
    } catch (err) {
        if (err.message) {
            err.status = 401;
        }
        next(err);
    }
};
