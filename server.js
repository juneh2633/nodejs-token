    // Package
const express = require("express");
const session = require("express-session");
const url = require("url");
const mysql = require("mysql");

    // Init
const app = express();
const port = 8001;

    //pattern
const pattern = /^[a-zA-Z0-9]{6,30}$/
const namePattern = /^[a-zA-Z가-힣]{1,30}$/;
const phonenumberPattern = /^[0-9]{11}$/
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const titlePattern = /^.{1,50}$/;
const maintextPattern = /^.{1,5000}$/;
const replyPattern = /^.{1,500}$/;




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
// const replyAPI = require("./src/routers/reply");
app.use("/", pageAPI);
app.use("/account", accountAPI);
app.use("/board", boardAPI);
// app.use("/reply", replyAPI);


// APIs
//html은 왜 public에 넣었을까



//@@@@@@@@@@@@@로그인
// restfull API
// 복수형 쓰지 않기
// 가독성 중시
// 대문자 사용하지 않기 (idFind => idfind or find/id)
// try 밖에 req받기
// 400 프론트가 잘못 접근했을 때



//============================댓글====================================


// get/board/1/replies 게시글의 댓글 목록 가져오기
app.get("/board/:uid/replies", (req, res, next) => {  
    try {
        if (req.session.id == null) {
            throw { status: 401, message: "dont have session" };
        }    

        const { uid } = req.params;
        if (uid == null) {
            throw { status: 400, message: "dont have params" };
        }
        const replies = [];

        //
        const query = `SELECT * FROM reply WHERE board_uid = ${uid}`;

        //db통신
        //
        const reply = {
            replyUid: 'reply_uid',
            boardUid: 'board_uid',
            id: 'id',
            title: 'title',
            replyMain: 'reply_main',
            replyCreateDate: '2023-12-12',
        };    
        for (let idx = 0; idx < 100; idx++){
            const reply = {
                replyUid: 'reply_uid',
                boardUid: 'board_uid',
                id: 'id',
                title: 'title',
                replyMain: 'reply_main',
                replyCreateDate: '2023-12-12',
            };            
            replies.push(reply);
        }

        
        //
        const result = {
            "message": "get replies success",
            "data": replies
        };      
        res.status(200).send(result);         
    } catch (err) {
        next(err);
    }
});

// post/board/1/reply 댓글 쓰기
app.post("/board/:uid/reply", (req, res, next) => {  
    try {
        if (req.session.id == null) {
            throw { status: 401, message: "dont have session" };
        }    

        const { uid } = req.params;
        const { id, replyMain } = req.query;
        if (uid == null) {
            throw { status: 400, message: "dont have params" };
        }
        if (id == null || replyMain == null ) {
            throw { status: 400, message: "dont have query" };
        }           

        //
        const query = `INSERT INTO reply ( id, board_uid, reply_main, reply_deleted) VALUES (${id}, ${uid}, ${replyMain}, 0)`;

        //
        const result = {
            "message": `Got a POST request at /board/${uid}/reply`,
            "data": replies
        };      
        res.status(200).send(result);         
    } catch (err) {
        next(err);
    }
});

// 댓글 가져올 떄 굳이 board/reply 할 필요 없다.
// => GET/reply

// put/board/1/reply/1 댓글 수정
app.put("/board/:boardUid/reply/:replyUid", (req, res, next) => {
    try {
        if (req.session.id == null) {
            throw { status: 401, message: "dont have session" };
        }    

        const { boardUid, replyUid } = req.params;
        const { replyMain } = req.query;
        if (boardUid == null || replyUid == null) {
            throw { status: 400, message: "dont have params" };
        }
        if (replyMain == null ) {
            throw { status: 400, message: "dont have query" };
        }     

        //
        const permisionQuery = `SELECT * FROM reply WHERE reply_uid = ${replyUid}`;

        const id = "";  //댓글 작성자 불러오기
        if (id != req.session.id) {
            throw { status: 401, message: "dont have permision" };
        }  

        const query = `UPDATE reply SET reply_main = ${replyMain} WHERE reply_uid = ${replyUid}`;


        //

        const result = {
            "message": `Got a PUT request at /board/${boardUid}/reply/${replyUid}`,
            "data": replies
        };      
        res.status(200).send(result);         
    } catch (err) {
        next(err);
    }
});

// delete /board/1/reply /1 댓글 삭제
app.delete("/board/:boardUid/reply/:replyUid", (req, res, next) => {
    try {
        if (req.session.id == null) {
            throw { status: 401, message: "dont have session" };
        }    

        const { boardUid, replyUid } = req.params;
        const { replyMain } = req.query;
        if (boardUid == null || replyUid == null) {
            throw { status: 400, message: "dont have params" };
        }
        if (replyMain == null ) {
            throw { status: 400, message: "dont have query" };
        }     

        //
        const permisionQuery = `SELECT * FROM reply WHERE reply_uid = ${replyUid}`;
        
        const id = "";  //댓글 작성자 불러오기
        if (id != req.session.id) {
            throw { status: 401, message: "dont have permision" };
        }  

        const query = `UPDATE reply SET reply_deletes = 1 WHERE reply_uid = ${replyUid}`;

        //

        const result = {
            "message": `Got a DELETE request at /board/${boardUid}/reply/${replyUid}`,
            "data": replies
        };      
        res.status(200).send(result);             
    } catch (err) {
        next(err);
    }
});

//================================================================================

app.use((err, req, res, next) => {
    if (err.status === 500) {
        res.status(500).send("500 error, something wrong");   
    }
    else {
        res.status(err.status).send(err.message);           
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