const router = require("express").Router();
const path = require("path");
const pgPool = require("../modules/pgPool");
const loginAuth = require("../middleware/loginAuth");
const queryCheck = require("../modules/queryCheck");
/////////-----board---------///////////
//  GET/all?page        =>게시글 목록 가져오기(pagenation)
//  GET/:uid            =>게시글 가져오기
//  POST/               =>게시글 작성
//  PUT/:uid            =>게시글 수정
//  DELETE/:uid         =>게시글 삭제
///////////////////////////////////////////

router.get("/all", loginAuth, async (req, res, next) => {
    const { page } = req.query;
    const pageSizeOption = 10;
    const result = {
        message: "get boards success",
        data: null,
    };

    try {
        try {
            queryCheck({ page });
        } catch {
            page = 1;
        }

        const sql = `SELECT * FROM board 
                     WHERE board_deleted = false
                     ORDER BY board_uid
                     LIMIT $1 OFFSET $2`;
        const queryResult = await pgPool.query(sql, [pageSizeOption, (parseInt(page) - 1) * pageSizeOption]);
        if (!queryResult || queryResult.rows.length === 0) {
            result.message = "no board";
        }
        result.data = queryResult.rows;
        res.status(200).send(result);
    } catch (err) {
        next(err);
    }
});

router.get("/:uid", loginAuth, async (req, res, next) => {
    const { uid } = req.params;
    const result = {
        message: "get board success",
        data: null,
        editable: false,
    };

    try {
        queryCheck({ uid });

        const sql = "SELECT * FROM board WHERE board_uid = $1 AND board_deleted = false";
        const queryResult = await pgPool.query(sql, [uid]);

        if (!queryResult || queryResult.rows.length === 0) {
            const error = new Error("board not Found");
            error.status = 404;
            next(error);
        }

        if (queryResult.rows[0].id === req.session.userId) {
            result.editable = true;
        }
        result.data = queryResult.rows[0];
        res.status(200).send(result);
    } catch (err) {
        next(err);
    }
});

// post 게시글 쓰기
router.post("/", loginAuth, async (req, res, next) => {
    const id = req.session.userId;
    const { title, maintext } = req.query;

    const today = new Date();

    try {
        queryCheck({ id, title, maintext });
        const sql = "INSERT INTO board( id, title, board_main, board_update_time , board_deleted) VALUES ($1 , $2 , $3, $4, false)";
        await pgPool.query(sql, [id, title, maintext, today]);

        res.status(200).send({ message: "Got a POST requst at /board" });
    } catch (err) {
        next(err);
    }
});
// put/1   게시글 수정
router.put("/:uid", loginAuth, async (req, res, next) => {
    const { uid } = req.params;
    const { title, maintext } = req.query;
    const id = req.session.userId;

    const today = new Date();
    const result = {
        message: `Got a PUT request at board/${uid}`,
    };

    try {
        queryCheck({ uid, title, maintext });
        const sql = "UPDATE board SET title = $1, board_main = $2, board_update_time = $3 WHERE board_uid = $4 AND id = $5";
        const queryResult = await pgPool.query(sql, [title, maintext, today, uid, id]);

        if (queryResult.rowCount === 0) {
            const error = new Error("update Fail");
            error.status = 400;
            throw error;
        }

        res.status(200).send(result);
    } catch (err) {
        next(err);
    }
});

// delete/1 게시글 삭제
router.delete("/:uid", loginAuth, async (req, res, next) => {
    const { uid } = req.params;
    const id = req.session.userId;
    const result = {
        message: `Got a DELETE request at /${uid}`,
    };
    const today = new Date();

    try {
        queryCheck({ uid, id });

        const sql = "UPDATE board SET board_update_time = $1, board_deleted = true WHERE board_uid = $2 AND id = $3";
        const queryResult = await pgPool.query(sql, [today, uid, id]);

        if (queryResult.rowCount === 0) {
            const error = new Error("delete Fail");
            error.status = 400;
            throw error;
        }

        res.status(200).send(result);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
