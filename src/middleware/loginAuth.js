const jwt = require("jsonwebtoken");
const tokenElement = require("../modules/tokenElement");
const verifyToken = require("../modules/verifyToken");
const signAccessToken = require("../modules/signAccessToken");
const mongoSession = require("../modules/mongoSession");

module.exports = async (req, res, next) => {
    const { accessToken } = req.cookies;
    const verifyAccessToken = verifyToken(accessToken);

    const exception = {
        message: "token expired",
        status: 401,
    };
    try {
        if (!accessToken || !verifyAccessToken) {
            throw exception;
        }

        next();
    } catch (err) {
        next(err);
    }
};
