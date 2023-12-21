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


router.get("/login", errors.haveSession, async (req, res, next) => {
 
    const { id, password } = req.query;
    const integrityCheck = errors.queryCheck({ id, password });     //{id, password}로 넣는 이유: query에 다른 값이 들어갈 수 있어서 id, password로 바로 넣어줘야 검사할 수 있다.
    if (!integrityCheck.success) {
        next(integrityCheck.error);
    }
    const result = {
        message: "login fail"
    };
    try {

        const sql = "SELECT * FROM user WHERE id = ? AND password = ?";
        const queryResult = await new Promise((resolve, reject) => {
            db.query(sql, [id, password], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    
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
    try {
        req.session.destroy();
        res.status(200).send(result);        
    } catch (err) {
        next(err);
    }
});


router.get("/find/id", errors.haveSession, async(req, res, next) => {   
    const { name, phonenumber } = req.query;
    const integrityCheck = errors.queryCheck({ name, phonenumber });
    if (!integrityCheck.success) {
        next(integrityCheck.error);
    }
    const result = {
        "message": "id not Found",
        "data": null
    };    

    try {

        if (!name || !phonenumber) {
            const error = new Error("id or phonenumber null");
            error.status = 400;
            throw error;
        }
        if (!namePattern.test(name) || !phonenumberPattern.test(phonenumber)) {
            const error = new Error("regex fault");
            error.status = 400;
            throw error;
        }

        const sql = "SELECT id FROM user WHERE name = ? AND phonenumber = ? AND user_deleted = 0";
        const queryResult = await new Promise ((resolve, reject) => {
            db.query(sql, [name, phonenumber], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });

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
    }
    const result = {
        "message": "password not Found",
        "data": null
    };    
    try {
        const sql = "SELECT password FROM user WHERE id = ? AND name = ? AND phonenumber = ? AND user_deleted = 0";
        const queryResult = await new Promise((resolve, reject) => {
            db.query(sql, [id, name, phonenumber], (err, results) => {
                if (err) {
                    reject(err);
                }
                resolve(results);
            });           
        });
        console.log(queryResult);
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

//회원정보 열람
// 내정보만 보는데 파라미터가 필요한가
// 아이디가 빈스트링으로 올 수 있다. => 정규표현식으로 사용
//null 빈값 undefined
router.get("/", errors.leckSession, async(req, res, next) => {
    const id = req.session.userId;
    const result = {
        "message": "Get account request",
        "data": null
    };    
    try {
        const sql = "SELECT * FROM user WHERE id = ?";
        const queryResult = await new Promise((resolve, reject) => {
            db.query(sql, [id], (err, results) => {
                if (err) {
                    reject(err);
                }
                resolve(results);
            }); 
        });
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
    }
    const result = {
        "message": "Got a Post request",
        "data": null
    };
    try {
        if (!pattern.test(id) || !pattern.test(password) || !pattern.test(passwordCheck) ||  !namePattern.test(name) || !phonenumberPattern.test(phonenumber)) {
            const error = new Error("regex fault");
            error.status = "400";
            throw error;
        }
        if (password != passwordCheck) {
            const error = new Error("password exception fault");
            error.status = "400";
            throw error;
        }

        const doubleCheckSql = "SELECT * FROM user WHERE id = ?";
        const doubleCheckQueryResult =  await new Promise((resolve, reject)=> {
            db.query(doubleCheckSql, [id], (err, results) => {
                if (err) {
                    reject(err);
                }
                resolve(results);
            });
        });
        if (doubleCheckQueryResult && doubleCheckQueryResult.length > 0) {
            const error = new Error("id already exist");
            error.status = "400";
            throw error;            
        }        

        const sql = "INSERT INTO user (id, password, name, phonenumber, user_deleted) VALUES (?, ?, ?, ?, 0)";
        await new Promise((resolve, reject)=> {
            db.query(sql, [id, password, name, phonenumber], (err, results) => {
                if (err) {
                    reject(err);
                }
                resolve();
            });
        });
        res.status(200).send(result);  
        
    } catch (err) {
        next(err);
    }
});

// put/1 회원정보 수정
// id 받을 필요가 없음
router.put("/", errors.leckSession, async(req, res, next) => {
    const { password, passwordCheck, name, phonenumber } = req.query;
    const result = {
        "message": "Got a PUT request",
        "data": null
    };      
    try { 
        if ( !password || !passwordCheck || !name || !phonenumber) {
            const error = new Error("dont have query");
            error.status = "400";
            throw error;
        }       
        if ( !pattern.test(password) || !pattern.test(passwordCheck) ||  !namePattern.test(name) || !phonenumberPattern.test(phonenumber)) {
            const error = new Error("regex fault");
            error.status = "400";
            throw error;
        }
        if (password != passwordCheck) {
            const error = new Error("password exception fault");
            error.status = "400";
            throw error;
        }
        const sql = "UPDATE user SET password = ?, name = ?, phonenumber = ? WHERE id = ? ";
        await new Promise((resolve, reject)=> {
            db.query(sql, [password, name, phonenumber, req.session.userId], (err, results) => {
                if (err) {
                    reject(err);
                }
                resolve();
            });
        });
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
        "data": null
    };     
    try {
        const sql = "UPDATE user SET user_deleted = 1 WHERE id = ? ";
        await new Promise((resolve, reject)=> {
            db.query(sql, [req.session.userId], (err, results) => {
                if (err) {
                    reject(err);
                }
                resolve();
            });
        });

        req.session.destroy();
        res.status(200).send(result);          
    } catch (err) {
        next(err);
    }
});

module.exports = router;// import


//db 연결 후 api 실행  (promise)
//
// +------------+--------+----------+-------------+---------------------+--------------+
// | id         | name   | password | phonenumber | user_create_date    | user_deleted |
// +------------+--------+----------+-------------+---------------------+--------------+
// | deletetest | test   | 12341234 | 01011112222 | 2023-12-20 13:46:36 |            1 |
// | test1234   | juneh  | 12341234 | 01085490120 | 2023-12-19 08:19:06 |            0 |
// | test2222   | change | 12341234 | 01011112222 | 2023-12-19 23:34:41 |            0 |
// | test3333   | test   | 12341234 | 01011112222 | 2023-12-19 23:16:33 |            0 |
// +------------+--------+----------+-------------+---------------------+--------------+