const jwt = require("jsonwebtoken");
const tokenElement = require("../modules/tokenElement");
const verifyToken = require("../modules/verifyToken");
const signAccessToken = require("../modules/signAccessToken");

module.exports = (req, res, next) => {
    const { accessToken, refreshToken } = req.cookies;
    const verifyAccessToken = verifyToken(accessToken);
    const verifyRefreshToken = verifyToken(refreshToken);
    const exception = {
        message: "dont have admin permission",
        status: 401,
    };

    if (accessToken) {
        if (!verifyAccessToken.success) {
            if (verifyAccessToken.expired && !verifyRefreshToken.expired && tokenElement(accessToken).idx === tokenElement(refreshToken).idx && tokenElement(accessToken).admin) {
                const newAccessToken = signAccessToken(tokenElement(accessToken).idx, tokenElement(accessToken).admin);
                res.cookie("accessToken", newAccessToken, { httpOnly: true, secure: false });
                console.log("refresh");
                next();
            } else {
                next(exception);
            }
        } else {
            if (tokenElement(accessToken).admin) {
                next();
            } else {
                next(exception);
            }
        }
    } else {
        next(exception);
    }
};
