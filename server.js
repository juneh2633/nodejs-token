const express = require("express");
const session = require("express-session");
const url = require("url");
const https = require("https");
const app = express();

const { httpPort, httpsPort } = require("./src/config/portConfig");
const httpsOptions = require("./src/config/httpsConfig");

const sessionConfig = require("./src/config/sessionConfig");

app.use(session(sessionConfig));
app.use(express.json());

const pageAPI = require("./src/routers/page");
app.use("/", pageAPI);

const accountAPI = require("./src/routers/account");
app.use("/account", accountAPI);

const boardAPI = require("./src/routers/board");
app.use("/board", boardAPI);

const replyAPI = require("./src/routers/reply");
app.use("/reply", replyAPI);

// 404에러는 자동으로 처리해준다.
// app.use((req, res, next) => {
//     res.status(404).send("NOT FOUND API");
// });

app.use((err, req, res, next) => {
    if (err.status) {
        res.status(err.status).send(err.message);
    } else {
        res.status(500).send("500 error, something wrong");
    }
});

app.listen(httpPort, () => {
    console.log(`${httpPort}번에서 HTTP 웹서버 실행`);
});

https.createServer(httpsOptions, app).listen(httpsPort, () => {
    console.log(`${httpsPort}번에서 HTTPS 웹서버 실행`);
});
