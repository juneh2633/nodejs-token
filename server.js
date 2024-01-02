//-----------------Import--------------------------------------------//
const express = require("express");
const session = require("express-session");
const url = require("url");
const https = require("https");
const app = express();

//-----------------config,----------------------------------//
const { httpPort, httpsPort } = require("./src/config/portConfig");
const httpConfig = require("./src/config/httpsConfig");
const sessionConfig = require("./src/config/sessionConfig");

app.use(session(sessionConfig));
app.use(express.json());

// const morgan = require("morgan");
// app.use(morgan("dev"));

//----------------------API-------------------------------------------//

const pageAPI = require("./src/routers/page");
app.use("/", pageAPI);

const accountAPI = require("./src/routers/account");
app.use("/account", accountAPI);

const boardAPI = require("./src/routers/board");
app.use("/board", boardAPI);

const replyAPI = require("./src/routers/reply");
app.use("/reply", replyAPI);

//----------------------------Middleware---------------------------------//
app.use((result, req, res, next) => {
    if (result instanceof Error) {
        next(result);
        return;
    }
    const input = Object.entries(req.query);
    const urlObj = url.parse(req.originalUrl);
    // await mongoClient
    //     .db("board_log")
    //     .collection("logs")
    //     .insertOne({
    //         ip: req.ip, // user ip
    //         method: req.method, // req method
    //         api_path: urlObj.pathname, // api path
    //         querystring: urlObj.query, // req query
    //         body: req.body, // req body
    //         req_time: req.date || null, // req time
    //         res_time: new Date(), // res time
    //         status_code: res.statusCode || 409, // status code
    //         result: JSON.stringify(result || {}), // result obj
    //     });
    console.log({
        level: "info",
        ip: req.ip, // user ip
        id: req.session.userId || null,
        method: req.method, // req method
        api_path: urlObj.pathname, // api path
        input: input,
        output: result,
        time: new Date(), // res time
    });
});
app.use((err, req, res, next) => {
    console.log(err);
    if (err.status) {
        res.status(err.status).send(err.message);
    } else {
        res.status(500).send("500 error, something wrong");
    }
});

//---------------------------web_server--------------------------------------///
app.listen(httpPort, () => {
    console.log(`${httpPort}번에서 HTTP 웹서버 실행`);
});

https.createServer(httpConfig, app).listen(httpsPort, () => {
    console.log(`${httpsPort}번에서 HTTPS 웹서버 실행`);
});
