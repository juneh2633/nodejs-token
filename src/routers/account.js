const router = require("express").Router();
const path = require("path");
const pgPool = require("../modules/pgPool");
const loginAuth = require("../middleware/loginAuth");
const logoutAuth = require("../middleware/logoutAuth");
const queryCheck = require("../modules/queryCheck");
/////////-----account---------///////////
//  GET/login           => 로그인
//  GET/logout          =>로그아웃
//  GET/find/id         =>아이디 찾기
//  GET/find/password   =>비밀번호 찾기
//  GET/                =>회원정보 열람
//  POST/               =>회원가입
//  PUT/                =>회원정보 수정
//  DELETE/             =>회원탈퇴
/////////////////////////////////////////

router.get("/login", logoutAuth, async (req, res, next) => {
    const { id, password } = req.query;
    const result = {
        message: "login fail",
    };

    try {
        queryCheck({ id, password });

        const sql = "SELECT * FROM account WHERE id = $1 AND password = $2 AND account_deleted = false";
        const queryResult = await pgPool.query(sql, [id, password]);
        if (queryResult.rows.length !== 0) {
            result.message = "login success";
            req.session.userId = queryResult.rows[0].id;
        }
        res.status(200).send(result);
    } catch (err) {
        next(err);
    }
});

router.get("/logout", loginAuth, (req, res, next) => {
    const result = {
        message: "logout success",
    };

    req.session.destroy();
    res.status(200).send(result);
});

router.get("/find/id", logoutAuth, async (req, res, next) => {
    const { name, phonenumber } = req.query;
    const result = {
        message: "id not Found",
        data: null,
    };

    try {
        queryCheck({ name, phonenumber });

        const sql = "SELECT id FROM account WHERE name = $1 AND phonenumber = $2 AND account_deleted = 0";
        const queryResult = await pgPool.query(sql, [name, phonenumber]);

        if (queryResult.rows.length > 0) {
            result.message = "id Found success";
            result.data = queryResult;
        }

        res.status(200).send(result);
    } catch (err) {
        next(err);
    }
});

router.get("/find/password", logoutAuth, async (req, res, next) => {
    const { id, name, phonenumber } = req.query;
    const result = {
        message: "password not Found",
        data: null,
    };

    try {
        queryCheck({ id, name, phonenumber });

        const sql = `SELECT password FROM account 
                     WHERE id = $1 AND name = $2 AND phonenumber = $3 AND account_deleted = 0`;
        const queryResult = await pgPool.query(sql, [id, name, phonenumber]);

        if (queryResult.rows.length !== 0) {
            console.log;
            result.message = "password Found success";
            result.data = queryResult;
        }

        res.status(200).send(result);
    } catch (err) {
        next(err);
    }
});

//===============================회원정보========================================

router.get("/", loginAuth, async (req, res, next) => {
    const id = req.session.userId;
    const result = {
        message: "Get account request",
        data: null,
    };

    try {
        const sql = "SELECT * FROM account WHERE id = ?";
        const queryResult = await pgPool.query(sql, [id]);

        if (queryResult && queryResult.rows.length !== 0) {
            result.data = {
                id: queryResult.rows[0].id,
                password: queryResult.rows[0].password,
                name: queryResult.rows[0].name,
                phonenumber: queryResult.rows[0].phonenumber,
            };
        } else {
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

router.post("/", logoutAuth, async (req, res, next) => {
    const { id, password, passwordCheck, name, phonenumber } = req.query;

    const result = {
        message: "Got a Post request",
    };

    try {
        queryCheck({ id, password, passwordCheck, name, phonenumber });

        const doubleCheckSql = "SELECT * FROM account WHERE id = $1";
        const doubleCheckQueryResult = await pgPool.query(doubleCheckSql, [id]);

        if (doubleCheckQueryResult.rows.length > 0) {
            const error = new Error("id already exist");
            error.status = "400";
            throw error;
        }

        const sql = "INSERT INTO account (id, password, name, phonenumber, account_deleted) VALUES ($1, $2, $3, $4, 0)";
        await pgPool.query(sql, [id, password, name, phonenumber]);

        res.status(200).send(result);
    } catch (err) {
        next(err);
    }
});

// put/ 회원정보 수정

router.put("/", loginAuth, async (req, res, next) => {
    const id = req.session.userId;
    const { password, passwordCheck, name, phonenumber } = req.query;

    const result = {
        message: "Got a PUT request",
    };

    try {
        queryCheck({ password, passwordCheck, name, phonenumber });

        const sql = "UPDATE account SET password = $1, name = $2, phonenumber = $3 WHERE id = $4 ";
        await pgPool.query(sql, [password, name, phonenumber, id]);

        res.status(200).send(result);
    } catch (err) {
        next(err);
    }
});

// delete/1 회원탈퇴
router.delete("/", loginAuth, async (req, res, next) => {
    const id = req.session.userId;
    const result = {
        message: "Got a Delete request",
    };

    try {
        const sql = "UPDATE account SET account_deleted = 1 WHERE id = $1 ";
        await pgPool.query(sql, [id]);

        req.session.destroy();
        res.status(200).send(result);
    } catch (err) {
        next(err);
    }
});

module.exports = router; // import
