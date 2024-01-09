const jwt = require("jsonwebtoken");

module.exports = (token) => {
    const result = {
        success: true,
        message: "",
        expired: false,
    };
    try {
        jwt.verify(token, process.env.SECRET_KEY);
    } catch (err) {
        result.success = false;
        result.message = err.message;
        result.expired = err.message === "jwt expired" ? true : false;
    } finally {
        return result;
    }
};
