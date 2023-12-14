    // Package
const express = require("express");
const url = require("url");

    // Init
const app = express();
const port = 8001;


const pattern = /^[a-zA-Z0-9]{6,30}$/
const namePattern = /^[a-zA-Z가-힣]{1,30}$/;
const phonenumberPattern = /^[0-9]{11}$/

app.use(session({
    secret: "juneh2633",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // HTTPS를 사용하는 경우 true로 설정 
}));

// Apis
//html은 왜 public에 넣었을까
app.get("/", (req, res) => {    //requist, response
    res.sendFile(`${__dirname}/public/index.html`); //__dirname (express의 기능: 현재까지의 절대경로)
});
app.get("/loginPage", (req, res) => {
    res.sendFile(`${__dirname}/public/login.html`);
});
app.get("/userCreatePage", (req, res) => {
    res.sendFile(`${__dirname}/public/userCreatePage.html`);
});
app.get("/userUpdatePage", (req, res) => {
    res.sendFile(`${__dirname}/public/userUpdatePage.html`);
});
app.get("/boardListPage", (req, res) => {
    res.sendFile(`${__dirname}/public/boardListPage.html`);
});
app.get("/boardCreatePage", (req, res) => {
    res.sendFile(`${__dirname}/public/boardCreatePage.html`);
});
app.get("/boardReadPage", (req, res) => {
    res.sendFile(`${__dirname}/public/boardReadPage.html`);
});



//@@@@@@@@@@@@@로그인
app.get("/accounts/login", (req, res) => {             
    const { id, password } = req.query;
    const result = {
        "success": false,
        "message": "",
        "data": null
    };
    //DB 통신

    
    const userName = "";
    const userPhonenumber = "";
    //

    req.session.id = id;
    req.session.password = password;
    req.session.name = userName;
    req.session.phonenumber = userPhonenumber;
    result = {
        "success": true,
        "message": "login success",
        "data": null
    };    

    //값 반환
    res.send(result);
});

//@@@@@@@@@@@@@@@로그아웃
app.get("/accounts/logout", (req, res) => {             
    const { id, password} = req.query;
    const result = {
        "success": false,
        "message": "",
        "data": null
    };

    req.session.destroy();
    result.success = true;
    result.message = "logout success";
    result.data = {};

    res.send(result);
});

//@@@@@@@@@@@@@ 아이디 찾기
app.get("/accounts/idFind", (req, res) => {            
    const { name, phonenumber } = req.query;
    const result = {
        "success": false,
        "message": "",
        "data": null
    };
    //DB 통신

    
    const foundId = "";
    //
    result = {
        "success": true,
        "message": "find id success",
        "data": { id: foundId }
    };   

    //값 반환
    res.send(result);
});



app.get("/accounts/passwordFind", (req, res) => {
    const { id, name, phonenumber } = req.query;
    const result = {
        "success": false,
        "message": "",
        "data": null
    };
    //DB 통신

    
    const foundPassword = "";
    //
    result = {
        "success": true,
        "message": "find password success",
        "data": { password: foundPassword }
    };      

    //값 반환
    res.send(result);
});


//===============================회원정보========================================

//회원정보 열람
// 내정보만 보는데 파라미터가 필요한가
app.get("/account/:id", (req, res) => {  
    const { id } = req.params;
    const result = {
        "success": false,
        "message": "",
        "data": null
    };
    if (req.session.id == null) {
        result.success = true;
        result.message = "please login first";
        result.data = null;                  
        res.send(result);
        return;
    }
    
    const userId = id;
    const userPassword = req.session.password;
    const userName = req.session.name;
    const userPhonenumber = req.session.phonenumber;
    

    //DB 통신 결과 처리
    result = {
        "success": true,
        "message": "account get success",
        "data": { id: userId, password: userPassword, name: userName, phonenumber: userPhonenumber }
    };

    //값 반환
    res.send(result);
});

// post/account 회원가입
app.post("/account", (req, res) => {  
    const { id, password, passwordCheck, name, phonenumber } = req.query;
    const result = {
        "success": false,
        "message": "",
        "data": null
    };

    //DB 통신

    //DB 통신 결과 처리
    result = {
        "success": true,
        "message": "account post success",
        "data": null
    };

    //값 반환
    res.send(result);
});
// put/account/1 회원정보 수정
app.put("/account/:id", (req, res) => {
    const { id } = req.params;
    const { password, passwordCheck, name, phonenumber } = req.query;
    const result = {
        "success": false,
        "message": "",
        "data": null
    };

    //DB 통신

    //DB 통신 결과 처리
    result = {
        "success": true,
        "message": `${id} account update success`,
        "data": null
    };

    //값 반환
    res.send(result);    
});
// delete/account/1 회원탈퇴
app.delete("/account/:id", (req, res) => {
    const { id } = req.params;
    const result = {
        "success": false,
        "message": "",
        "data": null
    };

    //
    //소프트딜리트 진행
    //
    result = {
        "success": true,
        "message": `${id} account delete success`,
        "data": null
    }; 
    //
    res.send(result);  
});

//===============================게시글=====================================
// get/boards?page=1 게시글 목록 가져오기
app.get("/boards", (req, res) => {  
    const { page } = req.query;
    const result = {
        "success": false,
        "message": "",
        "data": null
    };
    let boards = [];

    //
    const countQuery = "SELECT COUNT(*) FROM board WHERE board_deleted = 0";
    const boardsCount = 100; //db처리 
    let pageSize = 10;
    if (boardsCount < parseInt(page) * pageSize) {
        pageSize = 10 - parseInt(page) * pageSize + boardsCount;
    }
    const query = `SELECT * FROM board WHERE board_deleted = 0 LIMIT ${pageSize} OFFSET ${ parseInt(page) * 10}`;

    //db

    for (let idx = 0; idx < pageSize; idx++){
        const board = {
            boardUid: 'boardUid',
            id: 'id',
            title: 'title',
            boardCreateDate: '2023-12-12',
        };
        boards.push(board);
    }

    //
    result = {
        "success": true,
        "message": "get boards success",
        "data":  boards
    };      
    res.send(result);  
});

// get/board/1 게시글 가져오기
app.get("/board/:uid", (req, res) => {  
    const { uid } = req.params;
    const result = {
        "success": false,
        "message": "",
        "data": null
    };
    

    //
    const query = `SELECT * FROM board WHERE board_uid = ${uid}`;

    //db통신
    //
    const board = {
        boardUid: 'boardUid',
        id: 'id',
        title: 'title',
        maintext: 'maintext',
        boardCreateDate: '2023-12-12',
    };    

    //
    result = {
        "success": true,
        "message": "get board success",
        "data":  board
    };      
    
    res.send(result);  
});

// post/board 게시글 쓰기
app.post("/board", (req, res) => {  
    const { id, title, maintext } = req.query;
    const result = {
        "success": false,
        "message": "",
        "data": null
    };

    //DB 통신
    const today = "2023-12-12";
    const query = `INSERT INTO boards( id, title, maintext, board_create_date , board_deleted) VALUES (${ id }, ${ title }, ${ maintext }, ${ today }, 0)`
    

    //DB 통신 결과 처리
    result = {
        "success": true,
        "message": "board post success",
        "data":  null
    };      

    //값 반환
    res.send(result);
});
// put/board/1   게시글 수정
app.put("/board/:uid", (req, res) => {
    const { uid } = req.params;
    const { title, maintext } = req.query;
    const result = {
        "success": false,
        "message": "",
        "data": null
    };

    //DB 통신
    const query = `UPDATE board SET title = ${title}, maintext = ${maintext} WHERE board_uid = ${uid}`;


    //DB 통신 결과 처리
    result = {
        "success": true,
        "message": "board update success",
        "data": null
    };
    //값 반환
    res.send(result);        
});
// delete/board/1 게시글 삭제
app.delete("/board/:id", (req, res) => {
    const { uid } = req.params;
    const result = {
        "success": false,
        "message": "",
        "data": null
    };

    //DB 통신
    const query = `UPDATE board SET board_deleted = 1 WHERE board_uid = ${uid}`;

    
    //DB 통신 결과 처리
    result = {
        "success": true,
        "message": "board delete success",
        "data": null
    };
    //값 반환
    res.send(result);            
});

//============================댓글====================================


// get/board/1/replies 게시글의 댓글 목록 가져오기
app.get("/board/:id/replies", (req, res) => {  
    const { uid } = req.params;
    const result = {
        "success": false,
        "message": "",
        "data": null
    };
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

    result = {
        "success": true,
        "message": "get replies success",
        "data": replies
    };      
    
    res.send(result); 
});

// post/board/1/reply 댓글 쓰기
app.post("/board/:uid/reply", (req, res) => {  
    const { uid } = req.params;
    const { id, replyMain } = req.query;
    const result = {
        "success": false,
        "message": "",
        "data": null
    };

    //
    const query = `INSERT INTO reply ( id, board_uid, reply_main, reply_deleted) VALUES (${id}, ${uid}, ${replyMain}, 0)`;


    //

    result = {
        "success": true,
        "message": "post reply success",
        "data": replies
    };      
    
    res.send(result); 
});
// put/board/1/reply/1 댓글 수정
app.put("/board/:boardUid/reply/:replyUid", (req, res) => {
    const { boardUid, replyUid } = req.params;
    const { replyMain } = req.query;
    const result = {
        "success": false,
        "message": "",
        "data": null
    };

    //
    const query = `UPDATE reply SET reply_main = ${replyMain} WHERE reply_uid = ${replyUid}`;


    //

    result = {
        "success": true,
        "message": "update reply success",
        "data": replies
    };      
    
    res.send(result); 
});
// delete /board/1/reply /1 댓글 삭제
app.delete("/board/:boardUid/reply/:replyUid", (req, res) => {
    const { boardUid, replyUid } = req.params;
    const { replyMain } = req.query;
    const result = {
        "success": false,
        "message": "",
        "data": null
    };

    //
    const query = `UPDATE reply SET reply_deletes = 1 WHERE reply_uid = ${replyUid}`;


    //

    result = {
        "success": true,
        "message": "update reply success",
        "data": replies
    };      
    
    res.send(result);     
});

//================================================================================


//Web Server
    
app.listen(port, () => {
    console.log(`${port}번에서 웹서버 실행`)
})