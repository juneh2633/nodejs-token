    // Package
const express = require("express");
const url = require("url");

    // Init
const app = express();
const port = 8001;
    
// Apis
//html은 왜 public에 넣었을까
app.get("/", (req, res) => {    //requist, response
    res.sendFile(`${__dirname}/public/index.html`); //__dirname (express의 기능: 현재까지의 절대경로)
});
app.get("/loginPage", (req, res) => {
    res.sendFile(`${__dirname}/public/login.html`);

});

// get/accounts 회원정보 목록 가져오기
// =>get/accounts?id=test1234&password=12341234 로그인 기능
// =>get/accounts?name=왕준혁&phonenumber=01085490120 아이디 찾기
// =>get/accounts?id=test1234&name=왕준혁&phonenumber=01085490120 비밀번호 찾기
app.get("/accounts", (req, res) => {
    const { idx } = req.body;
    const result = {
        "success": false,
        "message": "",
        "date": null
    };
    //DB 통신

    //DB 통신 결과 처리
    result.success = true;
    result.date = {};

    //값 반환
    res.send(result);
});

//===============================회원정보========================================

//get/account/1 회원정보 가져오기
app.get("/account/?", (req, res) => {  

});
// post/account 회원가입
app.post("/account", (req, res) => {  

});
// put/account/1 회원정보 수정
app.put("/account/?", (req, res) => {
    
});
// delete/account/1 회원탈퇴
app.delete("/account/?", (req, res) => {
    
});

//===============================게시글=====================================
// get/boards 게시글 목록 가져오기
app.get("/boards", (req, res) => {  

});
// get/board/1 게시글 가져오기
app.get("/board/?", (req, res) => {  

});
// post/board 게시글 쓰기
app.post("/board", (req, res) => {  

});
// put/board/1   게시글 수정
app.put("/board/?", (req, res) => {
    
});
// delete/board/1 게시글 삭제
app.delete("/board/?", (req, res) => {
    
});

//============================댓글====================================


// get/board/1/replies 게시글의 댓글 목록 가져오기
app.get("/board/?/replies", (req, res) => {  

});

// get/board/1/reply/1 게시글 댓글 가져오기
app.get("/board/?/reply/?", (req, res) => {  

});

// post/board/1/reply/1 댓글 쓰기
app.post("/board/?/reply/?", (req, res) => {  
 
});
// put/board/1/reply/1 댓글 수정
app.put("/board/?/reply/?", (req, res) => {
    
});
// delete /board/1/reply /1 댓글 삭제
app.delete("/board/?/reply/?", (req, res) => {
    
});

//================================================================================


//Web Server
    
app.listen(port, () => {
    console.log(`${port}번에서 웹서버 실행`)
})