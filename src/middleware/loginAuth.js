const jwt = require("jsonwebtoken");
const tokenElement = require("../modules/tokenElement");
const verifyToken = require("../modules/verifyToken");
const signAccessToken = require("../modules/signAccessToken");

module.exports = (req, res, next) => {
    const { accessToken, refreshToken } = req.cookies;
    const verifyAccessToken = verifyToken(accessToken);
    const verifyRefreshToken = verifyToken(refreshToken);
    const error = new Error(verifyAccessToken.message);
    error.status = 401;
    if (accessToken) {
        if (!verifyAccessToken.success) {
            if (verifyAccessToken.expired && !verifyRefreshToken.expired && tokenElement(accessToken).idx === tokenElement(refreshToken).idx) {
                const newAccessToken = signAccessToken(tokenElement(accessToken).idx, tokenElement(accessToken).admin);
                res.cookie("accessToken", newAccessToken, { httpOnly: true, secure: false });
                console.log("refresh");
                next();
            } else {
                next(error);
            }
        } else {
            next();
        }
    } else {
        next(error);
    }
};
