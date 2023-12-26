const express = require("express");
const session = require("express-session");
const url = require("url");

const app = express();
const port = 8001;

app.use(
    session({
        secret: "juneh2633",
        resave: false, //변경이 없는 경우에도 다시 저장할지(매 request마다)
        saveUninitialized: true, //저장하지 않은 세션에 대해 아무내용없는 세션을 저장할지
        cookie: { secure: false }, // HTTPS를 사용하는 경우 true로 설정
    })
);
app.use(express.json()); //json을 통신할 수 있게 해주는 설정

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

app.listen(port, () => {
    console.log(`${port}번에서 웹서버 실행`);
});
