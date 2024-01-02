const router = require("express").Router();
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

//  GET/all?page        =>게시글 목록 가져오기(pagenation)
router.get("/all", loginAuth, async (req, res, next) => {
    const { page } = req.query;
    const pageSizeOption = 10;
    const result = {
        message: "get boards success",
        data: null,
    };

    try {
        const sql = `SELECT board.*, account.id FROM board
                     JOIN account ON
                     board.idx = account.idx
                     WHERE board.board_deleted = false
                     ORDER BY board.board_uid
                     LIMIT $1 OFFSET $2;`;
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

//  GET/:uid            =>게시글 가져오기
router.get("/:uid", loginAuth, async (req, res, next) => {
    const { uid } = req.params;
    const result = {
        message: "get board success",
        data: null,
        isMine: false,
    };

    try {
        queryCheck({ uid });

        const sql = "SELECT * FROM board WHERE board_uid = $1 AND board_deleted = false";
        const queryResult = await pgPool.query(sql, [uid]);

        if (!queryResult || queryResult.rows.length === 0) {
            const error = new Error("board not Found");
            error.status = 400;
            next(error);
        }

        if (queryResult.rows[0].idx === req.session.idx) {
            result.isMine = true;
        }
        //isMine, owner
        result.data = queryResult.rows[0];
        res.status(200).send(result);
    } catch (err) {
        next(err);
    }
});

//  POST/               =>게시글 작성
router.post("/", loginAuth, async (req, res, next) => {
    const idx = req.session.idx;
    const { title, boardContents } = req.query;
    const today = new Date();

    try {
        queryCheck({ title, boardContents });
        const sql = "INSERT INTO board( idx, title, contents, update_at , board_deleted) VALUES ($1 , $2 , $3, $4, false)";
        await pgPool.query(sql, [idx, title, boardContents, today]);

        res.status(200).send("Got a POST requst at /board");
    } catch (err) {
        next(err);
    }
});

//  PUT/:uid            =>게시글 수정
router.put("/:uid", loginAuth, async (req, res, next) => {
    const { uid } = req.params;
    const { title, boardContents } = req.query;
    const idx = req.session.idx;

    const today = new Date();

    try {
        queryCheck({ uid, title, boardContents });
        const sql = "UPDATE board SET title = $1, contents = $2, update_at = $3 WHERE board_uid = $4 AND idx = $5";
        const queryResult = await pgPool.query(sql, [title, boardContents, today, uid, idx]);

        if (queryResult.rowCount === 0) {
            const error = new Error("update Fail");
            error.status = 400;
            throw error;
        }

        res.status(200).send(`Got a PUT request at board/${uid}`);
    } catch (err) {
        next(err);
    }
});

//  DELETE/:uid         =>게시글 삭제
router.delete("/:uid", loginAuth, async (req, res, next) => {
    const { uid } = req.params;
    const idx = req.session.idx;
    const today = new Date();

    try {
        queryCheck({ uid });

        const sql = "UPDATE board SET update_at = $1, board_deleted = true WHERE board_uid = $2 AND idx = $3";
        const queryResult = await pgPool.query(sql, [today, uid, idx]);

        if (queryResult.rowCount === 0) {
            const error = new Error("delete Fail");
            error.status = 400;
            throw error;
        }

        res.status(200).send(`Got a DELETE request at /${uid}`);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
