const router = require("express").Router();
const path = require("path"); 
const db = require("../modules/database");
const errors = require("../modules/error");


// get/reply/:uid/?page 게시글의 댓글 목록 가져오기
router.get("/:uid", errors.leckSession, async(req, res, next) => {  //board의 uid
    const { uid } = req.params;
    const { page } = req.query;
    const pageSizeOption = 10;
    const integrityCheck = errors.queryCheck({ uid, page }); 
    if (!integrityCheck.success) {
        next(integrityCheck.error);
        return;
    }    
    try {
        const boardSql = "SELECT * FROM board WHERE board_uid = ? AND board_deleted = 0";
        const boardQueryResult = await new Promise((resolve, reject)=> {
            db.query(boardSql, [uid], (err, results) => {
                if (err) {
                    reject(err);
                }
                resolve(results);
            });
        });          
        if (!boardQueryResult || boardQueryResult.length !== 0) {
            const error = new Error("board not Found ");
            error.status = 404;
            next(error);     
        }
        const countSql = "SELECT COUNT(*) FROM reply WHERE reply_deleted = 0 AND board_uid = ?";
        const countQueryResult = await new Promise((resolve, reject)=> {
            db.query(countSql, [uid], (err, results) => {
                if (err) {
                    reject(err);
                }
                resolve(results);
            });
        });  
        
        const replyCount = parseInt(countQueryResult[0]['COUNT(*)']);
        if (replyCount < (parseInt(page)-1) * pageSizeOption) {   
            const error = new Error("reply not Found ");
            error.status = 404;
            next(error);            
        }
        const sql = "SELECT * FROM reply WHERE reply_deleted = 0 AND board_uid = ? LIMIT ? OFFSET ?";
        const queryResult = await new Promise((resolve, reject)=> {
            db.query(sql, [uid, pageSizeOption, (parseInt(page)-1) * pageSizeOption ], (err, results) => {
                if (err) {
                    reject(err);
                }
                resolve(results);
            });
        });  

        const result = {
            "message": "get replies success",
            "data": queryResult
        };      
        res.status(200).send(result);         
    } catch (err) {
        next(err);
    }
});

// post/reply/:uid 댓글 쓰기
router.post("/:uid", errors.leckSession, async(req, res, next) => {     //board의 uid
    const { uid } = req.params;
    const { replyMain } = req.query;
    const id = req.session.userId;
    const result = {
        "message": `Got a POST request at /reply/${uid}`,
    };      
    const integrityCheck = errors.queryCheck({ uid, replyMain }); 
    if (!integrityCheck.success) {
        next(integrityCheck.error);
        return;
    }    

    try {
        const sql = "INSERT INTO reply ( id, board_uid, reply_main, reply_deleted) VALUES (?, ?, ?, 0)";
        await new Promise((resolve, reject)=> {
            db.query(sql, [id, uid, replyMain], (err, results) => {
                if (err) {
                    reject(err);
                }
                resolve(results);
            });
        });       
        res.status(200).send(result);         
    } catch (err) {
        next(err);
    }
});


// put/board/1/reply/1 댓글 수정
router.put("/:uid", errors.leckSession, async (req, res, next) => {    //reply uid
    const { uid } = req.params;
    const { replyMain } = req.query;    
    const id = req.session.userId;
    const result = {
        "message": `Got a PUT request at /reply/${uid}`,
    };      
    console.log(replyMain);
    console.log("dddddddsdsds");
    const integrityCheck = errors.queryCheck({ uid, replyMain }); 
    if (!integrityCheck.success) {
        next(integrityCheck.error);
        return;
    }    
    try {
        const permisionSql = "SELECT * FROM reply WHERE reply_uid = ? AND id = ?";
        const permisionQueryResult = await new Promise((resolve, reject)=> {
            db.query(permisionSql, [uid, id], (err, results) => {
                if (err) {
                    reject(err);
                }
                resolve(results);
            });
        });  
        console.log("이걸 통과");
        if (!permisionQueryResult||permisionQueryResult.length === 0) {
            const error = new Error("dont have permision or reply not Found");
            error.status = 401;     
            next(error);
        }  
        const sql = "UPDATE reply SET reply_main = ? WHERE reply_uid = ?";
        await new Promise((resolve, reject)=> {
            db.query(sql, [replyMain, uid], (err, results) => {
                if (err) {
                    reject(err);
                }
                resolve(results);
            });
        });  

        res.status(200).send(result);         
    } catch (err) {
        next(err);
    }
});

// delete /댓글 삭제
router.delete("/:uid",  errors.leckSession, async(req, res, next) => {    //reply uid
    const { uid } = req.params;
    const { replyMain } = req.query;
    const integrityCheck = errors.queryCheck({ uid, replyMain }); 
    const result = {
        "message": `Got a DELETE request at /reply/${uid}`,
    };      
    if (!integrityCheck.success) {
        next(integrityCheck.error);
        return;
    }    
    try {
        const permisionSql = "SELECT * FROM reply WHERE reply_uid = ? AND id = ?";
        const permisionQueryResult = await new Promise((resolve, reject)=> {
            db.query(permisionSql, [uid, id], (err, results) => {
                if (err) {
                    reject(err);
                }
                resolve(result);
            });
        });  
        if (!permisionQueryResult||permisionQueryResult.length === 0) {
            const error = new Error("dont have permision");
            error.status = 401;     
            next(error);
        }  
        const sql = "UPDATE reply SET  reply_deleted = 1 WHERE reply_uid = ?";
        const queryResult = await new Promise((resolve, reject)=> {
            db.query(sql, [uid], (err, results) => {
                if (err) {
                    reject(err);
                }
                resolve(results);
            });
        });  

        res.status(200).send(result);             
    } catch (err) {
        next(err);
    }
});

module.exports = router;
