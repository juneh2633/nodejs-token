    // Package
const express = require("express");
const session = require("express-session");
const url = require("url");
const mysql = require("mysql");

    // Init
const app = express();
const port = 8001;


app.use(session({
    secret: "juneh2633",
    resave: false,  //변경이 없는 경우에도 다시 저장할지(매 request마다)
    saveUninitialized: true,    //저장하지 않은 세션에 대해 아무내용없는 세션을 저장할지
    cookie: { secure: false } // HTTPS를 사용하는 경우 true로 설정 
}));
app.use(express.json()); //json을 통신할 수 있게 해주는 설정

const pageAPI = require("./src/routers/page");
const accountAPI = require("./src/routers/account");
const boardAPI = require("./src/routers/board");
const replyAPI = require("./src/routers/reply");
app.use("/", pageAPI);
app.use("/account", accountAPI);
app.use("/board", boardAPI);
app.use("/reply", replyAPI);


// APIs
//html은 왜 public에 넣었을까



//@@@@@@@@@@@@@로그인
// restfull API
// 복수형 쓰지 않기
// 가독성 중시
// 대문자 사용하지 않기 (idFind => idfind or find/id)
// try 밖에 req받기
// 400 프론트가 잘못 접근했을 때



//================================================================================
app.use((req, res, next) => {
    res.status(404).send("NOT FOUND API");
});


app.use((err, req, res, next) => {
    if (err.status !== 500) {
        res.status(err.status).send(err.message);     
    }
    else {
        res.status(500).send("500 error, something wrong");             
    }
});
//Web Server
    
app.listen(port, () => {
    console.log(`${port}번에서 웹서버 실행`)
})

//질문
//세션 체크는 중복된 코드이지만, 이를 미들웨어로 따로 만들었을 때, 코드가 더 길어질 수 있는데, 그래도 따로 만들어주는게 맞나요
//db로 불러온 값도 체크해줘야 하나요( ex: 불러온 제목의 정규식 검사)
//api 코드 길어질거 같은데, 따로 분리 안해도 되나요
//에러 핸들링 에서 메세지에 숫자만 쓰는 사람도 봤는데 보통 어떻게 하는게 정답인가요