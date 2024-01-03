const router = require("express").Router();
const pgPool = require("../modules/pgPool");
const mongoClient = require("../modules/mongoClient");
const queryCheck = require("../modules/queryCheck");
/////////-------log---------///////////
//  GET/all             =>모두 가져오기
//  GET/                =>
/////////////////////////////////////////
router.get("/all", async (req, res, next) => {
    const { orderBy } = req.query;
    const asc = orderBy === "desc" ? -1 : 1;
    const result = {
        data: null,
    };
    try {
        const queryResult = await mongoClient.find().sort({ time: asc }).toArray();

        result.data = queryResult;
        res.status(200).send(result);
    } catch (err) {
        next(err);
    }
});
router.get("/", async (req, res, next) => {
    const { orderBy, id, method, api, fromDate, toDate } = req.query;
    const asc = orderBy === "desc" ? -1 : 1;
    const result = {
        data: null,
    };
    let findObj = {};

    if (id) {
        findObj.id = id === "null" ? null : id;
    }
    if (method) {
        findObj.method = method;
    }
    if (api) {
        findObj.api = api;
    }
    if (fromDate) {
        if (!toDate) {
            findObj.time = {
                $gte: new Date(fromDate),
            };
        } else {
            findObj.time = {
                $gte: new Date(fromDate),
                $lte: new Date(toDate),
            };
        }
    }

    console.log(findObj);
    try {
        const queryResult = await mongoClient.find(findObj).sort({ time: asc }).toArray();

        result.data = queryResult;
        res.status(200).send(result);
    } catch (err) {
        next(err);
    }
});

module.exports = router;
