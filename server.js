    // Package
const express = require("express");
const url = require("url");

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
app.get("/accounts/login", (req, res, next) => {       
    try {
        if (req.session.id) {
            throw { status: 401, message: "already have session" };
        }
        const { id, password } = req.query;
        if (id == null || password == null) {
            throw { status: 400, message: "dont have query" };
        }

        //DB 통신

        
        const userName = "";
        const userPhonenumber = "";
        //
        
        req.session.id = id;
        req.session.password = password;
        req.session.name = userName;
        req.session.phonenumber = userPhonenumber;
    

        //값 반환
        const result = {
            "message": "login success",
            "data": null
        };            
        res.status(200).send(result);       
    } catch (err) {
        next(err);
    }
});

//@@@@@@@@@@@@@@@로그아웃
app.get("/accounts/logout", (req, res, next) => {             
    try {
        if (!req.session.id) {
            throw { status: 401, message: "dont have id session" };
        }        
        const result = {
            "message": "logout success",
            "data": null
        };
        req.session.destroy();
        res.status(200).send(result);        
    } catch (err) {
        next(err);
    }
});

//@@@@@@@@@@@@@ 아이디 찾기
app.get("/accounts/idFind", (req, res, next) => {    
    try {
        if (req.session.id) {
            throw { status: 401, message: "already have session" };
        }

        const { name, phonenumber } = req.query;
        if (!pattern.test(name) || !phonenumberPattern.test(phonenumber)) {
            throw { status: 400, message: "regex fault" };
        }

        //DB 통신

        
        const foundId = "";
        //

        //값 반환

        const result = {
            "message": "find id success",
            "data": { id: foundId }
        };        
        res.status(200).send(result);        
    } catch (err) {
        next(err);
    }
});

app.get("/accounts/passwordFind", (req, res, next) => {
    try {
        if (req.session.id) {
            throw { status: 401, message: "already have session" };
        }

        const { id, name, phonenumber } = req.query;
        if (!pattern.test(id)||!pattern.test(name) || !phonenumberPattern.test(phonenumber)) {
            throw { status: 400, message: "regex fault" };
        }

        //DB 통신

        //
        
        const foundPassword = "";

        //값 반환
        const result = {
            "message": "find password success",
            "data": { password: foundPassword }
        };        
        res.status(200).send(result);        
    } catch (err) {
        next(err);
    }
});


//===============================회원정보========================================

//회원정보 열람
// 내정보만 보는데 파라미터가 필요한가
app.get("/account/:id", (req, res, next) => {
    try {
        if (req.session.id == null) {
            throw { status: 401, message: "dont have id session" };
        }        
        const { id } = req.params;
        if (id == null) {
            throw { status: 400, message: "dont have params " };
        }

        const userId = id;
        const userPassword = req.session.password;
        const userName = req.session.name;
        const userPhonenumber = req.session.phonenumber;
        if (userId == null || userPassword == null || userName == null || userPhonenumber == null) {
            throw { status: 400, message: "dont have session" };
        }    
        
        //DB 
        //

        //값 반환
        const result = {
            "message": "account get success",
            "data": { id: userId, password: userPassword, name: userName, phonenumber: userPhonenumber }
        };        
        res.status(200).send(result);    
    } catch (err) {
        next(err);
    }
});

// post/account 회원가입
app.post("/account", (req, res, next) => { 
    try {
        if (req.session.id) {
            throw { status: 401, message: "already have session" };
        }

        const { id, password, passwordCheck, name, phonenumber } = req.query;
        if (id == null || password == null || passwordCheck == null || name == null || phonenumber == null) {
            throw { status: 400, message: "dont have query" };
        }     
        if (!pattern.test(id) || !pattern.test(password) || !pattern.test(passwordCheck) ||  !pattern.test(name) || !phonenumberPattern.test(phonenumber)) {
            throw { status: 400, message: "regex fault" };
        }
        if (password != passwordCheck) {
            throw { status: 400, message: "password exception fault" };
        }
        //DB 통신

        //값 반환
        const result = {
            "message": "account post success",
            "data": null
        };
        res.status(200).send(result);  
        
    } catch (err) {
        next(err);
    }
});

// put/account/1 회원정보 수정
app.put("/account/:id", (req, res, next) => {
    try {
        if (req.session.id == null) {
            throw { status: 401, message: "dont have session" };
        }      
        const { id } = req.params;
        if (id == null) {
            throw { status: 400, message: "dont have params" };
        }
        if (id != req.session.id) {
            throw { status: 401, message: "dont have permision" };
        }        
        const { password, passwordCheck, name, phonenumber } = req.query;
        if ( password == null || passwordCheck == null || name == null || phonenumber == null) {
            throw { status: 400, message: "dont have query" };
        }           
        if ( !pattern.test(password) || !pattern.test(passwordCheck) ||  !pattern.test(name) || !phonenumberPattern.test(phonenumber)) {
            throw { status: 400, message: "regex fault" };
        }
        if (password != passwordCheck) {
            throw { status: 400, message: "password exception fault" };
        }
        //DB 통신
        //


        //값 반환
        const result = {
            "message": `${id} account update success`,
            "data": null
        };        
        res.status(200).send(result);          
    } catch (err) {
        next(err);
    }
});
// delete/account/1 회원탈퇴
app.delete("/account/:id", (req, res, next) => {
    try {
        if (req.session.id == null) {
            throw { status: 401, message: "dont have session" };
        }      

        const { id } = req.params;    
        if (id == null) {
            throw { status: 400, message: "dont have params" };
        }

        //
        //소프트딜리트 진행
        //

        const result = {
            "message": `${id} account delete success`,
            "data": null
        }; 
        res.status(200).send(result);          
    } catch (err) {
        next(err);
    }
});

//===============================게시글=====================================
// get/boards?page=1 게시글 목록 가져오기
app.get("/boards", (req, res, next) => {  
    try {
        if (req.session.id == null) {
            throw { status: 401, message: "dont have session" };
        }      
        const { page } = req.query;
        if (page == null) {
            throw { status: 400, message: "dont have query" };
        }                

        let boards = [];

        //
        const countQuery = "SELECT COUNT(*) FROM board WHERE board_deleted = 0";
        const boardsCount = 100; //db로 받을 값 예시
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
                boardCreateDate: '2023-12-12',  //db로 받을 값 예시
            };
            boards.push(board);
        }

        //
        const result = {
            "message": "get boards success",
            "data":  boards
        };      
        res.status(200).send(result);          
    } catch (err) {
        next(err);
    }    
});

// get/board/1 게시글 가져오기
app.get("/board/:uid", (req, res, next) => {
    try {
        if (req.session.id == null) {
            throw { status: 401, message: "dont have session" };
        }    
        
        const { uid } = req.params;
        if (uid == null) {
            throw { status: 400, message: "dont have params" };
        }    
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
        const result = {
            "message": "get board success",
            "data":  board
        };      
        res.status(200).send(result);          
    } catch (err) {
        next(err);
    }
});

// post/board 게시글 쓰기
app.post("/board", (req, res, next) => {  
    try {
        if (req.session.id == null) {
            throw { status: 401, message: "dont have session" };
        }    
        

        const { id, title, maintext } = req.query;
        if (id == null || title == null || maintext == null) {
            throw { status: 400, message: "dont have query" };
        }           
        if ( !titlePattern.test(title) || !maintextPattern.test(maintext)) {
            throw { status: 400, message: "regex fault" };
        }

        //DB 통신
        let today = "2023-12-12";//날짜 db로 불러오기
        const query = `INSERT INTO boards( id, title, maintext, board_create_date , board_deleted) VALUES (${ id }, ${ title }, ${ maintext }, ${ today }, 0)`
        

        const result = {
            "message": "board post success",
            "data":  null
        };      
        res.status(200).send(result);        
    } catch (err) {
        next(err);
    }

});
// put/board/1   게시글 수정
app.put("/board/:uid", (req, res, next) => {
    try {
        if (req.session.id == null) {
            throw { status: 401, message: "dont have session" };
        }   
        
        const { uid } = req.params;
        if (uid == null) {
            throw { status: 400, message: "dont have params" };
        }
        const { title, maintext } = req.query;
        if ( title == null || maintext == null) {
            throw { status: 400, message: "dont have query" };
        }             

        //DB 통신
        const query = `UPDATE board SET title = ${title}, maintext = ${maintext} WHERE board_uid = ${uid}`;



        const result = {
            "message": "board update success",
            "data": null
        };
        res.status(200).send(result);             
    } catch (err) {
        next(err);
    }
   
});

// delete/board/1 게시글 삭제
app.delete("/board/:uid", (req, res, next) => {
    try {
        if (req.session.id == null) {
            throw { status: 401, message: "dont have session" };
        }    

        const { uid } = req.params;
        if (uid == null) {
            throw { status: 400, message: "dont have params" };
        }

        //DB 통신
        const query = `UPDATE board SET board_deleted = 1 WHERE board_uid = ${uid}`;

        
        //DB 통신 결과 처리
        const result = {
            "message": "board delete success",
            "data": null
        };
        //값 반환
        res.status(200).send(result);            
    } catch (err) {
        next(err);
    }
    
});

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
            "message": "post reply success",
            "data": replies
        };      
        res.status(200).send(result);         
    } catch (err) {
        next(err);
    }
});

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
        const query = `UPDATE reply SET reply_main = ${replyMain} WHERE reply_uid = ${replyUid}`;


        //

        const result = {
            "message": "update reply success",
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
        const query = `UPDATE reply SET reply_deletes = 1 WHERE reply_uid = ${replyUid}`;

        //

        const result = {
            "message": "update reply success",
            "data": replies
        };      
        res.status(200).send(result);             
    } catch (err) {
        next(err);
    }
});

app.use((req, req, next) => {
    res.status(404).send("cant find file");
});
app.use((err, req, res, next) => {
    if (err && err.status) {
        res.status(err.status).send(err.message);
    }
    else {
        res.status(500).send("something wrong");
    }
});

//================================================================================


//Web Server
    
app.listen(port, () => {
    console.log(`${port}번에서 웹서버 실행`)
})