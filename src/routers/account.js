const router = require("express").Router();
const path = require("path"); 
const db = require("../modules/database");
const errors = require("../modules/error");

router.get("/login", errors.haveSession, async (req, res, next) => {
    const { id, password } = req.query;

    const integrityCheck = errors.queryCheck({ id, password });    
    if (!integrityCheck.success) {
        next(integrityCheck.error);
        return;
    }
    
    const result = {
        message: "login fail"
    };
    try {

        const sql = "SELECT * FROM user WHERE id = ? AND password = ?";
        // const queryResult = await new Promise((resolve, reject) => {
        //     db.query(sql, [id, password], (err, results) => {
        //         if (err) {
        //             reject(err);
        //         } else {
        //             resolve(results);
        //         }
        //     });
        // });
        const queryResult = await db.queryPromise(sql, [id, password]);

        if (queryResult && queryResult.length !== 0 && queryResult[0].user_deleted === 0) {
            result.message = "login success";
            req.session.userId = queryResult[0].id;
        }
        res.status(200).send(result);       
    } catch (err) {
        next(err);
    }
});

router.get("/logout", errors.leckSession, (req, res, next) => {     
    const result = {
        "message": "logout success",
    };    
    
    req.session.destroy();
    res.status(200).send(result);        
});

router.get("/find/id", errors.haveSession, async(req, res, next) => {   
    const { name, phonenumber } = req.query;

    const integrityCheck = errors.queryCheck({ name, phonenumber });
    if (!integrityCheck.success) {
        next(integrityCheck.error);
        return;
    }

    const result = {
        "message": "id not Found",
        "data": null
    };    

    try {
        const sql = "SELECT id FROM user WHERE name = ? AND phonenumber = ? AND user_deleted = 0";
        const queryResult = await db.queryPromise(sql, [name, phonenumber])

        if (queryResult && queryResult.length > 0 ) {
            result.message = "id Found success";
            result.data = queryResult;
        }

        res.status(200).send(result);        
    } catch (err) {
        next(err);
    }
});

router.get("/find/password", errors.haveSession, async(req, res, next) => {
    const { id, name, phonenumber } = req.query;
    const integrityCheck = errors.queryCheck({ id, name, phonenumber });
    if (!integrityCheck.success) {
        next(integrityCheck.error);
        return;
    }
    const result = {
        "message": "password not Found",
        "data": null
    };    

    try {
        const sql = "SELECT password FROM user WHERE id = ? AND name = ? AND phonenumber = ? AND user_deleted = 0";
        const queryResult = await db.queryPromise(sql, [id, name, phonenumber]);

        if (queryResult && queryResult.length !== 0) {
            console.log
            result.message = "password Found success";
            result.data = queryResult;
        }

        res.status(200).send(result);  
      
    } catch (err) {
        next(err);
    }
});


//===============================회원정보========================================

router.get("/", errors.leckSession, async(req, res, next) => {
    const id = req.session.userId;
    const result = {
        "message": "Get account request",
        "data": null
    };    

    try {
        const sql = "SELECT * FROM user WHERE id = ?";
        const queryResult = await db.queryPromise(sql, [id])

        if (queryResult && queryResult.length !== 0) {
            result.data = {
                "id": queryResult[0].id,
                "password": queryResult[0].password,
                "name": queryResult[0].name,
                "phonenumber": queryResult[0].phonenumber
            };
        }
        else {
            const error = new Error("id not Found");
            error.status = 404;
            throw error;
        }

        res.status(200).send(result);    
    } catch (err) {
        next(err);
    }
});

// post 회원가입

router.post("/", errors.haveSession, async(req, res, next) => { 
    const { id, password, passwordCheck, name, phonenumber } = req.query;
    const integrityCheck = errors.queryCheck({ id, password, passwordCheck, name, phonenumber });
    if (!integrityCheck.success) {
        next(integrityCheck.error);
        return;
    }
    const result = {
        "message": "Got a Post request",
    };

    try {
        const doubleCheckSql = "SELECT * FROM user WHERE id = ?";
        const doubleCheckQueryResult = await db.queryPromise(doubleCheckSql, [id]);

        if (doubleCheckQueryResult && doubleCheckQueryResult.length > 0) {
            const error = new Error("id already exist");
            error.status = "400";
            throw error;            
        }        

        const sql = "INSERT INTO user (id, password, name, phonenumber, user_deleted) VALUES (?, ?, ?, ?, 0)";
        await db.queryPromise(sql, [id, password, name, phonenumber]);

        res.status(200).send(result);  
        
    } catch (err) {
        next(err);
    }
});

// put/ 회원정보 수정

router.put("/", errors.leckSession, async(req, res, next) => {
    const { password, passwordCheck, name, phonenumber } = req.query;
    const integrityCheck = errors.queryCheck({ password, passwordCheck, name, phonenumber });
    if (!integrityCheck.success) {
        next(integrityCheck.error);
        return;
    }
    const result = {
        "message": "Got a PUT request",
    };      

    try { 
        const sql = "UPDATE user SET password = ?, name = ?, phonenumber = ? WHERE id = ? ";
        await db.queryPromise(sql, [password, name, phonenumber, req.session.userId]);

        res.status(200).send(result);          
    } catch (err) {
        next(err);
    }
});

// delete/1 회원탈퇴
router.delete("/", errors.leckSession, async (req, res, next) => {  
    const id = req.session.userId;
    const result = {
        "message": "Got a Delete request",
    };     

    try {
        const sql = "UPDATE user SET user_deleted = 1 WHERE id = ? ";
        await db.queryPromise(sql, [req.session.userId])

        req.session.destroy();
        res.status(200).send(result);      
    } catch (err) {
        next(err);
    }
});

module.exports = router;// import
