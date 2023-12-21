const router = require("express").Router();
const path = require("path"); 
const db = require("../modules/database");
const errors = require("../modules/error");
const pattern = /^[a-zA-Z0-9]{6,30}$/
const namePattern = /^[a-zA-Z가-힣]{1,30}$/;
const phonenumberPattern = /^[0-9]{11}$/
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const titlePattern = /^.{1,50}$/;
const maintextPattern = /^.{1,5000}$/;
const replyPattern = /^.{1,500}$/;


//===============================게시글=====================================
// gets?page=1 게시글 목록 가져오기
router.get("/all", (req, res, next) => {  
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

// get/1 특정 게시글 가져오기
router.get("/:uid", (req, res, next) => {
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

// post 게시글 쓰기
router.post("", (req, res, next) => {  
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
            "message": "Got a POST requst at ",
            "data":  null
        };      
        res.status(200).send(result);        
    } catch (err) {
        next(err);
    }

});
// put/1   게시글 수정
router.put("/:uid", (req, res, next) => {
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
        const permisionQuery = `SELECT * FROM board WHERE board_uid = ${uid}`;
        const id = "";  //게시글 작성자 불러오기
        if (id != req.session.id) {
            throw { status: 401, message: "dont have permision" };
        }  
        const query = `UPDATE board SET title = ${title}, maintext = ${maintext} WHERE board_uid = ${uid}`;



        const result = {
            "message": `Got a PUT request at /${uid}`,
            "data": null
        };
        res.status(200).send(result);             
    } catch (err) {
        next(err);
    }
   
});

// delete/1 게시글 삭제
router.delete("/:uid", (req, res, next) => {
    try {
        if (req.session.id == null) {
            throw { status: 401, message: "dont have session" };
        }    

        const { uid } = req.params;
        if (uid == null) {
            throw { status: 400, message: "dont have params" };
        }

        //DB 통신
        const permisionQuery = `SELECT * FROM board WHERE board_uid = ${uid}`;
        const id = "";  //게시글 작성자 불러오기
        if (id != req.session.id) {
            throw { status: 401, message: "dont have permision" };
        }  
        const query = `UPDATE board SET board_deleted = 1 WHERE board_uid = ${uid}`;

        
        //DB 통신 결과 처리
        const result = {
            "message": `Got a DELETE request at /${uid}`,
            "data": null
        };
        //값 반환
        res.status(200).send(result);            
    } catch (err) {
        next(err);
    }
    
});

module.exports = router;// import
