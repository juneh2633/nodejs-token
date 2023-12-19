const router = require("express").Router();
const path = require("path"); 
const db = require("../modules/database");


const pattern = /^[a-zA-Z0-9]{6,30}$/
const namePattern = /^[a-zA-Z가-힣]{1,30}$/;
const phonenumberPattern = /^[0-9]{11}$/
const datePattern = /^\d{4}-\d{2}-\d{2}$/;
const titlePattern = /^.{1,50}$/;
const maintextPattern = /^.{1,5000}$/;
const replyPattern = /^.{1,500}$/;


router.get("/login", async(req, res, next) => {  
    const { id, password } = req.query;
    const result = {
        message: "login fail",
        data: null
    };

    try {
        if (req.session.userId) {
            const error = new Error("already have session");
            error.status = "401";
            throw error;
        }
        
        if (!pattern.test(id) || !pattern.test(password)) {
            const error = new Error("dont have query");
            error.status = "400";
            throw error;
        }

        //DB 통신
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
        if (queryResult && queryResult.length !== 0) {
            result.message = "login success";
            req.session.userId = queryResult[0].id;
        }
        console.log(req.session.userId);
        res.status(200).send(result);       
    } catch (err) {
        next(err);
    }
});

router.get("/logout", (req, res, next) => {     
    const result = {
        "message": "logout success",
        "data": null
    };    
    try {
        if (!req.session.userId) {
            const error = new Error("dont have id session");
            error.status = "401";
            throw error;
        }        

        req.session.destroy();
        res.status(200).send(result);        
    } catch (err) {
        next(err);
    }
});


router.get("/find/id", async(req, res, next) => {   
    const { name, phonenumber } = req.query;
    const result = {
        "message": "id not Found",
        "data": null
    };    

    try {
        if (req.session.userId) {
            const error = new Error("already have session");
            error.status = "401";
            throw error;
        }
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

        const sql = "SELECT id FROM user WHERE name = ? AND phonenumber = ?";
        const queryResult = await new Promise ((resolve, reject) => {
            db.query(sql, [name, phonenumber], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });

        if (queryResult && queryResult.length > 0) {
            result.message = "id Found success";
            result.data = queryResult;
        }
        
        res.status(200).send(result);        
    } catch (err) {
        next(err);
    }
});

router.get("/find/password", async(req, res, next) => {
    const { id, name, phonenumber } = req.query;
    const result = {
        "message": "password not Found",
        "data": null
    };    
    try {
        if (req.session.userId) {
            const error = new Error("already have session");
            error.status = "401";
            throw error;
        }
        if (!id || !name || !phonenumber) {
            const error = new Error("id, name or phonenumber null");
            error.status = "400";
            throw error;            
        }
        if (!pattern.test(id) || !namePattern.test(name) || !phonenumberPattern.test(phonenumber)) {
            error.message = "regex fault";
            error.status = "400";
            throw error;
        }

        const sql="SELECT password FROM user WHERE id = ? AND name = ? AND phonenumber = ?"
        const queryResult = await new Promise((resolve, reject) => {
            db.query(sql, [id, name, phonenumber], (err, results) => {
                if (err) {
                    reject(err);
                }
                resolve(results);
            });           
        });

        if (queryResult && queryResult.length !== 0) {
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
router.get("/", async(req, res, next) => {
    const id = req.session.userId;
    const result = {
        "message": "password not Found",
        "data": null
    };    
    try {
        if (!id||id.length===0) {
            const error = new Error("dont have id session");
            error.status = 401;
            throw error;
        }        

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
            console.log("DDD");
            console.log(queryResult);
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

router.post("/", async(req, res, next) => { 
    const { id, password, passwordCheck, name, phonenumber } = req.query;
    const result = {
        "message": "Got a Post request at ",
        "data": null
    };
    try {
        if (req.session.userId) {
            const error = new Error("already have session");
            error.status = "401";
            throw error;
        }        
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
router.put("/", (req, res, next) => {
    try {
        if (req.session.userId == null) {
            throw { status: 401, message: "dont have session" };
        }      
        const id = req.session.userId;
        if (id == null) {
            throw { status: 400, message: "dont have params" };
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
            "message": `Got a PUT request at /${id}`,
            "data": null
        };        
        res.status(200).send(result);          
    } catch (err) {
        next(err);
    }
});
// delete/1 회원탈퇴
router.delete("/:id", (req, res, next) => {
    try {
        if (req.session.userId == null) {
            throw { status: 401, message: "dont have session" };
        }      

        const { id } = req.params;    
        if (id == null) {
            throw { status: 400, message: "dont have params" };
        }
        if (id != req.session.userId) {
            throw { status: 401, message: "dont have permision" };
        }  
        //
        //소프트딜리트 진행
        //

        const result = {
            "message": `Got a DELETE request at /${id}`,
            "data": null
        }; 
        res.status(200).send(result);          
    } catch (err) {
        next(err);
    }
});

module.exports = router;// import


//db 연결 후 api 실행  (promise)
//