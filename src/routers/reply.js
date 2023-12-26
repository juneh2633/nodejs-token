const router = require("express").Router();
const path = require("path");
const pgPool = require("../modules/pgPool");
const loginAuth = require("../middleware/loginAuth");
const queryCheck = require("../modules/queryCheck");
/////////-----reply---------///////////                     uid
//  GET/:uid?page           =>댓글 가져오기(pagenation)      board_uid
//  POST/:uid               =>댓글 작성                     board_uid
//  PUT/:uid                =>댓글 수정                     reply_uid
//  DELETE/:uid             =>댓글 삭제                     reply_uid
////////////////////////////////////////////////////////////////////
//board_uid를 줄 떄, REST적으로 맞지 않으므로 query로 주는게 낫다.

// get/reply/:uid/?page 게시글의 댓글 목록 가져오기
router.get("/", loginAuth, async (req, res, next) => {
    //board의 uid
    const id = req.session.userId;
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
            if (elem.id === id) {
                elem.editable = true;
            } else {
                elem.editable = false;
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
    const { uid, replyMain } = req.query;
    const id = req.session.userId;
    const result = {
        message: `Got a POST request at /reply/${uid}`,
    };
    const today = new Date();
    try {
        queryCheck({ uid, replyMain });
        const sql = "INSERT INTO reply ( id, board_uid, reply_main, reply_update_time, reply_deleted) VALUES ($1, $2, $3, $4,false)";
        await pgPool.query(sql, [id, uid, replyMain, today]);

        res.status(200).send(result);
    } catch (err) {
        next(err);
    }
});

// Put/:uid 댓글 수정
router.put("/:uid", loginAuth, async (req, res, next) => {
    //reply uid
    const { uid } = req.params;
    const { replyMain } = req.query;
    const id = req.session.userId;
    const result = {
        message: `Got a PUT request at /reply/${uid}`,
    };
    const today = new Date();
    try {
        queryCheck({ uid, replyMain });

        const sql = "UPDATE reply SET reply_main = $1, reply_update_time = $2 WHERE reply_uid = $3 AND id = $4";
        const queryResult = await pgPool.query(sql, [replyMain, today, uid, id]);
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

// Delete/:uid 댓글 삭제
router.delete("/:uid", loginAuth, async (req, res, next) => {
    //reply uid
    const { uid } = req.params;
    const { replyMain } = req.query;
    const id = req.session.userId;

    const result = {
        message: `Got a DELETE request at /reply/${uid}`,
    };

    try {
        queryCheck({ uid, replyMain });

        const sql = "UPDATE reply SET  reply_deleted = true, reply_update_time = $1 WHERE reply_uid = $2 AND id = $3";
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
