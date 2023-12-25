const router = require("express").Router();
const path = require("path"); 
const db = require("../modules/database");
const errors = require("../modules/error");
const sessionCheck = require("../modules/session-check");

/////////-----board---------///////////
//  GET/all?page        =>게시글 목록 가져오기(pagenation)
//  GET/:uid            =>게시글 가져오기
//  POST/               =>게시글 작성
//  PUT/:uid            =>게시글 수정
//  DELETE/:uid         =>게시글 삭제
///////////////////////////////////////////


router.get("/all", sessionCheck.have, async(req, res, next) => {  
    const { page } = req.query;
    const pageSizeOption = 10;

    const integrityCheck = errors.queryCheck({ page }); 
    if (!integrityCheck.success) {
        next(integrityCheck.error);
        return;
    }    

    try {

        const countSql = "SELECT COUNT(*) FROM board WHERE board_deleted = 0";
        const countQueryResult = await db.queryPromise(countSql, [])
 
        const boardsCount = parseInt(countQueryResult[0]['COUNT(*)']);
        if (boardsCount < (parseInt(page)-1) * pageSizeOption) {   
            const error = new Error("board not Found ");
            error.status = 404;
            next(error);            
        }

        const sql = "SELECT * FROM board WHERE board_deleted = 0 LIMIT ? OFFSET ?";
        const queryResult = await db.queryPromise(sql, [pageSizeOption, (parseInt(page) - 1) * pageSizeOption]);

        const result = {
            "message": "get boards success",
            "data":  queryResult
        };      

        res.status(200).send(result);          
    } catch (err) {
        next(err);
    }    
});


router.get("/:uid", sessionCheck.have, async (req, res, next) => {
    const { uid } = req.params;

    const integrityCheck = errors.queryCheck({ uid }); 
    if (!integrityCheck.success) {
        next(integrityCheck.error);
        return;
    }       

    const result = {
        "message": "get board success",
        "data": null
    };      
    try {
        const sql = "SELECT * FROM board WHERE board_uid = ? AND board_deleted = 0";
        const queryResult = await db.queryPromise(sql, [uid]);

        if (!queryResult || queryResult.length === 0) {
            const error = new Error("board not Found");
            error.status = 404;
            next(error);
        }

        result.data = queryResult;
        res.status(200).send(result);          
    } catch (err) {
        next(err);
    }
});

// post 게시글 쓰기
router.post("/", sessionCheck.have, async(req, res, next) => {  
    const id = req.session.userId;
    const { title, maintext } = req.query; 
    
    const integrityCheck = errors.queryCheck({ id, title, maintext }); 
    if (!integrityCheck.success) {
        next(integrityCheck.error);
        return;
    }        

    const today = new Date();

    try {
        const sql = "INSERT INTO board( id, title, maintext, board_update_time , board_deleted) VALUES (? , ? , ?, ?, 0)"
        await db.queryPromise(sql, [id, title, maintext, today]);

        res.status(200).send({ "message": "Got a POST requst at /board" });
    } catch (err) {
        next(err);
    }

});
// put/1   게시글 수정
router.put("/:uid", sessionCheck.have, async (req, res, next) => {
    const { uid } = req.params;
    const { title, maintext } = req.query;
    const id = req.session.userId;

    const integrityCheck = errors.queryCheck({ uid, title, maintext }); 
    if (!integrityCheck.success) {
        next(integrityCheck.error);
        return;
    }    

    const today = new Date();
    const result = {
        "message": `Got a PUT request at board/${uid}`
    };

    try {
        const permisionSql = "SELECT * FROM board WHERE board_uid = ? AND id = ?";
        const permisionQueryResult = await db.queryPromise(permisionSql, [uid, id]);
        if (!permisionQueryResult||permisionQueryResult.length === 0) {
            const error = new Error("dont have permision or board not Found");
            error.status = 401;     
            next(error);
        }  
        const sql = "UPDATE board SET title = ?, maintext = ?, board_update_time = ? WHERE board_uid = ?";
        await db.queryPromise(sql, [title, maintext, today, uid]);

        res.status(200).send(result);             
    } catch (err) {
        next(err);
    }
   
});

// delete/1 게시글 삭제
router.delete("/:uid", sessionCheck.have,  async(req, res, next) => {
    const { uid } = req.params;

    const integrityCheck = errors.queryCheck({ uid }); 
    if (!integrityCheck.success) {
        next(integrityCheck.error);
        return;
    } 

    const today = new Date();
    const result = {
        "message": `Got a DELETE request at /${uid}`,
    };

    try {
        const permisionSql = "SELECT * FROM board WHERE board_uid = ? AND id = ?";
        const permisionQueryResult = await db.queryPromise(permisionSql, [uid, id]);

        if (!permisionQueryResult||permisionQueryResult.length === 0) {
            const error = new Error("dont have permision");
            error.status = 401;     
            next(error);
        }  

        const sql = "UPDATE board SET board_update_time = ?, bord_deleted = 1 WHERE board_uid = ?";
        const queryResult = await db.queryPromise(sql, [today, uid]);     

        res.status(200).send(result); 

    } catch (err) {
        next(err);
    }
    
});

module.exports = router;
