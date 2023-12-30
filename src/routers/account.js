const router = require("express").Router();
const path = require("path");
const pgPool = require("../modules/pgPool");
const loginAuth = require("../middleware/loginAuth");
const logoutAuth = require("../middleware/logoutAuth");
const queryCheck = require("../modules/queryCheck");
const pwHash = require("../modules/pwHash");
const pwCompare = require("../modules/pwComapre");
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

//  GET/login           => 로그인
router.get("/login", logoutAuth, async (req, res, next) => {
    const { id, password } = req.query;
    const result = {
        message: "login fail",
    };

    try {
        queryCheck({ id, password });
        const sql = "SELECT * FROM account WHERE id = $1  AND account_deleted = false";
        const queryResult = await pgPool.query(sql, [id]);

        if (queryResult.rows.length !== 0) {
            const match = await pwCompare(password, queryResult.rows[0].password);

            if (match) {
                result.message = "login success";
                req.session.idx = queryResult.rows[0].idx;
            }
        }

        res.status(200).send(result);
    } catch (err) {
        next(err);
    }
});

//  GET/logout          =>로그아웃
router.get("/logout", loginAuth, (req, res, next) => {
    const result = {
        message: "logout success",
    };

    req.session.destroy();
    res.status(200).send(result);
});

//  GET/find/id         =>아이디 찾기
router.get("/find/id", logoutAuth, async (req, res, next) => {
    const { name, phonenumber } = req.query;
    const result = {
        message: "id Found success",
        data: null,
    };
    try {
        queryCheck({ name, phonenumber });

        const sql = "SELECT id FROM account WHERE name = $1 AND phonenumber = $2 AND account_deleted = false";
        const queryResult = await pgPool.query(sql, [name, phonenumber]);

        if (queryResult.rows.length === 0) {
            res.status(400).send("id not Found");
            return;
        }

        result.data = queryResult.rows[0].id;
        res.status(200).send(result);
    } catch (err) {
        next(err);
    }
});

//  GET/find/password   =>비밀번호 찾기
router.get("/find/password", logoutAuth, async (req, res, next) => {
    const { id, name, phonenumber } = req.query;
    const result = {
        message: "password Found success",
        data: null,
    };

    try {
        queryCheck({ id, name, phonenumber });

        const sql = `SELECT password FROM account WHERE id = $1 AND name = $2 AND phonenumber = $3 AND account_deleted = false`;
        const queryResult = await pgPool.query(sql, [id, name, phonenumber]);

        if (queryResult.rows.length === 0) {
            res.status(400).send("password not Found");
            return;
        }

        result.data = queryResult.rows[0].password; //해시된 값 출력
        res.status(200).send(result);
    } catch (err) {
        next(err);
    }
});

//===============================회원정보========================================

//  GET/                =>회원정보 열람
router.get("/", loginAuth, async (req, res, next) => {
    const idx = req.session.idx;
    const result = {
        message: "Get account request",
        data: null,
    };

    try {
        const sql = "SELECT * FROM account WHERE idx = $1";
        const queryResult = await pgPool.query(sql, [idx]);

        if (!queryResult || queryResult.rows.length === 0) {
            const error = new Error("id not Found");
            error.status = 404;
            throw error;
        }

        result.data = {
            id: queryResult.rows[0].id,
            //password: queryResult.rows[0].password,
            name: queryResult.rows[0].name,
            phonenumber: queryResult.rows[0].phonenumber,
        };
        res.status(200).send(result);
    } catch (err) {
        next(err);
    }
});

//  POST/               =>회원가입
router.post("/", logoutAuth, async (req, res, next) => {
    const { id, password, passwordCheck, name, phonenumber } = req.query;

    try {
        queryCheck({ id, password, passwordCheck, name, phonenumber });
        const pwHashed = await pwHash(password);

        const doubleCheckSql = "SELECT * FROM account WHERE id = $1";
        const doubleCheckQueryResult = await pgPool.query(doubleCheckSql, [id]);

        if (doubleCheckQueryResult.rows.length > 0) {
            const error = new Error("id already exist");
            error.status = "400";
            throw error;
        }

        const sql = "INSERT INTO account (id, name, password, phonenumber, account_deleted) VALUES ($1, $2, $3, $4, false)";
        await pgPool.query(sql, [id, name, pwHashed, phonenumber]);

        res.status(200).send("Got a Post request");
    } catch (err) {
        next(err);
    }
});

//  PUT/                =>회원정보 수정
router.put("/", loginAuth, async (req, res, next) => {
    const idx = req.session.idx;
    const { password, passwordCheck, name, phonenumber } = req.query;

    try {
        queryCheck({ password, passwordCheck, name, phonenumber });
        const pwHashed = await pwHash(password);
        const sql = "UPDATE account SET password = $1, name = $2, phonenumber = $3 WHERE idx = $4 ";
        await pgPool.query(sql, [pwHashed, name, phonenumber, idx]);

        res.status(200).send("Got a PUT request");
    } catch (err) {
        next(err);
    }
});

//  DELETE/             =>회원탈퇴
router.delete("/", loginAuth, async (req, res, next) => {
    const idx = req.session.idx;

    try {
        const sql = "UPDATE account SET account_deleted = true WHERE idx = $1 ";
        await pgPool.query(sql, [idx]);

        req.session.destroy();
        res.status(200).send("Got a Delete request");
    } catch (err) {
        next(err);
    }
});

module.exports = router;
