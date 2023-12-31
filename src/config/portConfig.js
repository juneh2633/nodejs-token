require("dotenv").config();

module.exports = {
    httpPort: process.env.HTTPPORT,
    httpsPort: process.env.HTTPSPORT,
};
