const jwt = require("jsonwebtoken");
const tokenElement = require("../modules/tokenElement");
const verifyToken = require("../modules/verifyToken");
const signAccessToken = require("../modules/signAccessToken");
const mongoSession = require("../modules/mongoSession");

module.exports = async (req, res, next) => {
    const { accessToken, refreshToken } = req.cookies;
    const verifyAccessToken = verifyToken(accessToken);
    const verifyRefreshToken = verifyToken(refreshToken);
    const error = new Error(verifyAccessToken.message);
    error.status = 401;

    const sid = await mongoSession.find({ sid: req.session.id }).toArray();
    console.log(sid);

    try {
        if (!accessToken) {
            throw error;
        }
        if (!verifyAccessToken.success) {
            if (!verifyAccessToken.expired && !verifyRefreshToken.success) {
                // 토큰이 expired 되었을 때만 넘어가기
                throw error;
            }

            if (tokenElement(accessToken).idx !== tokenElement(refreshToken).idx) {
                throw error;
            }
            const newAccessToken = signAccessToken(tokenElement(accessToken).idx, tokenElement(accessToken).admin);
            res.cookie("accessToken", newAccessToken, { httpOnly: true, secure: false });
            console.log("refresh");
        }
        console.log(sid.length);
        if (sid.length === 0) {
            error.message = "Environment has changed or Logged in from a different environment";
            error.status = 403;
            req.session.destroy();
            res.clearCookie("accessToken");
            res.clearCookie("refreshToken");
            throw error;
        }
        next();
    } catch (err) {
        next(err);
    }
};
