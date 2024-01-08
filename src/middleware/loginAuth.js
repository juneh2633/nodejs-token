const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
    const token = req.cookies.token;
    console.log(token);
    try {
        if (!token) {
            throw new Error("no token");
        }

        jwt.verify(token, process.env.SECRET_KEY);

        const payload = token.split(".")[1];
        const convert = Buffer.from(payload, "base64"); // base64로 인코딩 된 payload를 다시 디코딩 하는 작업
        const data = JSON.parse(convert.toString()); // 디코딩 된 것을 json으로 바꿔주는 작업
        req.decode = data;
        console.log(payload);
        console.log(convert);
        console.log(data);
        next();
    } catch (err) {
        if (err.message === "no token" || err.message === "jwt expired" || err.message === "invalid token") {
            err.status = 401;
        }
        next(err);
    }
};
