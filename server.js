//-----------------Import--------------------------------------------//
const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const url = require("url");
const https = require("https");
const app = express();

//-----------------config----------------------------------//
require("dotenv").config();
const { httpPort, httpsPort } = require("./src/config/portConfig");
const httpConfig = require("./src/config/httpsConfig");
const sessionConfig = require("./src/config/sessionConfig");

//----------------middleWare------------------------------------------//
app.use(cookieParser());
app.use(session(sessionConfig));
app.use(express.json());

// app.get("*", (req, res, next) => {
//     const protocol = req.protocol;
//     if (protocol === "http") {
//         const dest = `https://${req.hostname}:${httpsPort}${req.url}`;
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

//----------------------------logger---------------------------------//
const logger = require("./src/middleware/logger");
app.use(logger);

//----------------------------error_handler---------------------------------//
app.use((err, req, res, next) => {
    if (err.status) {
        res.status(err.status).send(err.message);
    } else {
        res.status(500).send("500 error, something wrong");
    }
});

//---------------------------listener--------------------------------------///
app.listen(httpPort, () => {
    console.log(`${httpPort}번에서 HTTP 웹서버 실행`);
});

https.createServer(httpConfig, app).listen(httpsPort, () => {
    console.log(`${httpsPort}번에서 HTTPS 웹서버 실행`);
});
