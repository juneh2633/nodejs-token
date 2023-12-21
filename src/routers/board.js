const router = require("express").Router();
const path = require("path"); 
const db = require("../modules/database");
const errors = require("../modules/error");


//===============================게시글=====================================
// gets?page=1 게시글 목록 가져오기
router.get("/all", errors.leckSession, async(req, res, next) => {  
    const { page } = req.query;
    const pageSizeOption = 10;
    const integrityCheck = errors.queryCheck({ page }); 
    if (!integrityCheck.success) {
        next(integrityCheck.error);
    }    
    try {

        const countSql = "SELECT COUNT(*) FROM board WHERE board_deleted = 0";
        const countQueryResult = await new Promise((resolve, reject)=> {
            db.query(countSql, [], (err, results) => {
                if (err) {
                    reject(err);
                }
                resolve(results);
            });
        });  
 
        const boardsCount = parseInt(countQueryResult[0]['COUNT(*)']);
        console.log(boardsCount);
        if (boardsCount < (parseInt(page)-1) * pageSizeOption) {   
            const error = new Error("board not Found ");
            error.status = 404;
            next(error);            
        }
        const sql = "SELECT * FROM board WHERE board_deleted = 0 LIMIT ? OFFSET ?";
        const queryResult = await new Promise((resolve, reject)=> {
            db.query(sql, [pageSizeOption, (parseInt(page)-1) * pageSizeOption ], (err, results) => {
                if (err) {
                    reject(err);
                }
                resolve(results);
            });
        });  

        const result = {
            "message": "get boards success",
            "data":  queryResult
        };      
        res.status(200).send(result);          
    } catch (err) {
        next(err);
    }    
});

// get/1 특정 게시글 가져오기
router.get("/:uid", errors.leckSession, async (req, res, next) => {
    const { uid } = req.params;
    const integrityCheck = errors.queryCheck({ uid }); 
    if (!integrityCheck.success) {
        next(integrityCheck.error);
    }       
    const result = {
        "message": "get board success",
        "data": null
    };      
    try {
        const sql = "SELECT * FROM board WHERE board_uid = ? AND board_deleted = 0";
        const queryResult = await new Promise((resolve, reject)=> {
            db.query(sql, [uid], (err, results) => {
                if (err) {
                    reject(err);
                }
                resolve(results);
            });
        });  

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
router.post("/", errors.leckSession, async(req, res, next) => {  
    const id = req.session.userId;
    const { title, maintext } = req.query;    
    const integrityCheck = errors.queryCheck({ id, title, maintext }); 
    if (!integrityCheck.success) {
        next(integrityCheck.error);
    }        
    const today = new Date();
    try {
        const sql = "INSERT INTO board( id, title, maintext, board_update_time , board_deleted) VALUES (? , ? , ?, ?, 0)"
        await new Promise((resolve, reject)=> {
            db.query(sql, [id, title, maintext, today], (err, results) => {
                if (err) {
                    reject(err);
                }
                resolve();
            });
        });        

        res.status(200).send({ "message": "Got a POST requst at /board" });
    } catch (err) {
        next(err);
    }

});
// put/1   게시글 수정
router.put("/:uid", errors.leckSession, async (req, res, next) => {
    const { uid } = req.params;
    const { title, maintext } = req.query;
    const id = req.session.userId;
    console.log(id);
    const integrityCheck = errors.queryCheck({ uid, title, maintext }); 
    if (!integrityCheck.success) {
        next(integrityCheck.error);
    }    
    const today = new Date();
    const result = {
        "message": `Got a PUT request at board/${uid}`
    };
    try {
        const permisionSql = "SELECT * FROM board WHERE board_uid = ? AND id = ?";
        const permisionQueryResult = await new Promise((resolve, reject)=> {
            db.query(permisionSql, [uid, id], (err, results) => {
                if (err) {
                    reject(err);
                }
                resolve(result);
            });
        });  
        if (!permisionQueryResult||permisionQueryResult.length === 0) {
            const error = new Error("dont have permision or board not Found");
            error.status = 401;     
            next(error);
        }  
        const sql = "UPDATE board SET title = ?, maintext = ?, board_update_time = ? WHERE board_uid = ?";
        const queryResult = await new Promise((resolve, reject)=> {
            db.query(sql, [title, maintext, today, uid], (err, results) => {
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

// delete/1 게시글 삭제
router.delete("/:uid", errors.leckSession,  async(req, res, next) => {
    const { uid } = req.params;
    const integrityCheck = errors.queryCheck({ uid }); 
    if (!integrityCheck.success) {
        next(integrityCheck.error);
    } 
    const today = new Date();
    const result = {
        "message": `Got a DELETE request at /${uid}`,
    };
    try {
        const permisionSql = "SELECT * FROM board WHERE board_uid = ? AND id = ?";
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
        const sql = "UPDATE board SET board_update_time = ?, bord_deleted = 1 WHERE board_uid = ?";
        const queryResult = await new Promise((resolve, reject)=> {
            db.query(sql, [today, uid], (err, results) => {
                if (err) {
                    reject(err);
                }
                resolve(results);
            });
        });          
    } catch (err) {
        next(err);
    }
    
});

module.exports = router;// import
