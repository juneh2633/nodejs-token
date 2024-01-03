const mongoClient = require("../modules/mongoClient");
const url = require("url");
module.exports = async (result, req, res, next) => {
    const input = Object.entries(req.query);
    const urlObj = url.parse(req.originalUrl);

    try {
        if (result instanceof Error) {
            await mongoClient.insertOne({
                level: "error",
                ip: req.ip,
                id: req.session.userId || null,
                method: req.method,
                api_path: urlObj.pathname,
                input: input || null,
                status: result.status || 500,
                message: result.message || null,
                time: new Date(),
            });
            next(result);
            return;
        }

        await mongoClient.insertOne({
            level: "info",
            ip: req.ip,
            id: req.session.userId || null,
            method: req.method,
            api_path: urlObj.pathname,
            input: input || null,
            output: result,
            time: new Date(),
        });
    } catch (err) {
        next(err);
    }
};
