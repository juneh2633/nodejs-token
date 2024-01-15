//-----------------Import--------------------------------------------//
const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const url = require("url");
const https = require("https");
const app = express();

//-----------------config----------------------------------//
require("dotenv").config();
const { HTTP_PORT, HTTPS_PORT } = require("./src/config/portConfig");
const httpConfig = require("./src/config/httpsConfig");
const sessionConfig = require("./src/config/sessionConfig");

//----------------middleWare------------------------------------------//
app.use(cookieParser());
app.use(session(sessionConfig));
app.use(express.json());

// app.get("*", (req, res, next) => {
//     const protocol = req.protocol;
//     if (protocol === "http") {
//         const dest = `https://${req.hostname}:${HTTPS_PORT}${req.url}`;
//         res.redirect(dest);
//     }
//     next();
// });

//---------------------------API-------------------------------------------//

const accountAPI = require("./src/routers/account");
app.use("/account", accountAPI);

const boardAPI = require("./src/routers/board");
app.use("/board", boardAPI);

const replyAPI = require("./src/routers/reply");
app.use("/reply", replyAPI);

const logAPI = require("./src/routers/log");
app.use("/log", logAPI);

const testAPI = require("./src/routers/test");
app.use("/test", testAPI);

//----------------------------logger---------------------------------//
const logger = require("./src/middleware/logger");
app.use(logger);

//----------------------------error_handler---------------------------------//
app.use((err, req, res, next) => {
    if (err.status) {
        return res.status(err.status).send(err.message);
    }

    res.status(500).send("500 error, something wrong");
});

//---------------------------listener--------------------------------------///
app.listen(HTTP_PORT, () => {
    console.log(`${HTTP_PORT}번에서 HTTP 웹서버 실행`);
});

https.createServer(httpConfig, app).listen(HTTPS_PORT, () => {
    console.log(`${HTTPS_PORT}번에서 HTTPS 웹서버 실행`);
});
