const router = require("express").Router();
const pgPool = require("../modules/pgPool");
const loginAuth = require("../middleware/loginAuth");
const queryCheck = require("../modules/queryCheck");
/////////-----reply---------///////////                     uid
//  GET/:uid?page           =>댓글 가져오기(pagenation)      board_uid
//  POST/:uid               =>댓글 작성                     board_uid
//  PUT/:uid                =>댓글 수정                     reply_uid
//  DELETE/:uid             =>댓글 삭제                     reply_uid
////////////////////////////////////////////////////////////////

// get/reply/:uid/?page 게시글의 댓글 목록 가져오기
router.get("/", loginAuth, async (req, res, next) => {
    //board의 uid
    const idx = req.session.idx;
    const { uid, page } = req.query;
    const pageSizeOption = 10;

    const result = {
        message: "get replies success",
        data: null,
    };

    try {
        queryCheck({ uid, page });

        const sql = "SELECT * FROM reply WHERE reply_deleted = false AND board_uid = $1 ORDER BY reply_uid LIMIT $2 OFFSET $3";
        let queryResult = await pgPool.query(sql, [uid, pageSizeOption, (parseInt(page) - 1) * pageSizeOption]);
        if (!queryResult || queryResult.rows.length === 0) {
            result.message = "no reply";
        }
        queryResult.rows.forEach((elem) => {
            if (elem.idx === idx) {
                elem.isMine = true;
            } else {
                elem.isMine = false;
            }
        });

        result.data = queryResult.rows;
        res.status(200).send(result);
    } catch (err) {
        next(err);
    }
});

// post/reply/:uid 댓글 쓰기
router.post("/", loginAuth, async (req, res, next) => {
    //board의 uid
    const { uid, replyContents } = req.query;
    const idx = req.session.idx;

    const today = new Date();
    try {
        queryCheck({ uid, replyContents });
        const sql = "INSERT INTO reply ( idx, board_uid, contents, update_at, reply_deleted) VALUES ($1, $2, $3, $4,false)";
        await pgPool.query(sql, [idx, uid, replyContents, today]);

        res.status(200).send(`Got a POST request at /reply/${uid}`);
    } catch (err) {
        next(err);
    }
});

// Put/:uid 댓글 수정
router.put("/:uid", loginAuth, async (req, res, next) => {
    //reply uid
    const { uid } = req.params;
    const { replyContents } = req.query;
    const idx = req.session.idx;

    const today = new Date();
    try {
        queryCheck({ uid, replyContents });

        const sql = "UPDATE reply SET contents = $1, update_at = $2 WHERE reply_uid = $3 AND idx = $4";
        const queryResult = await pgPool.query(sql, [replyContents, today, uid, idx]);
        if (queryResult.rowCount === 0) {
            const error = new Error("update Fail");
            error.status = 400;
            throw error;
        }

        res.status(200).send(`Got a PUT request at /reply/${uid}`);
    } catch (err) {
        next(err);
    }
});

// Delete/:uid 댓글 삭제
router.delete("/:uid", loginAuth, async (req, res, next) => {
    //reply uid
    const { uid } = req.params;
    const idx = req.session.idx;
    const today = new Date();
    try {
        queryCheck({ uid });

        const sql = "UPDATE reply SET reply_deleted = true, update_at = $1 WHERE reply_uid = $2 AND idx = $3";

        const queryResult = await pgPool.query(sql, [today, uid, idx]);
        console.log("쿼리는 성공했네");
        if (queryResult.rowCount === 0) {
            const error = new Error("delete Fail");
            error.status = 400;
            throw error;
        }
        res.status(200).send(`Got a DELETE request at /reply/${uid}`);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
