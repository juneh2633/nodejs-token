const winston = require("winston");
require("winston-mongodb");
const { combine, timestamp, label, printf } = winston.format;
const logFormat = printf(({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] ${level}: ${message}`;
});
module.exports = winston.createLogger({
    level: "info",
    //format: winston.format.combine(winston.format.timestamp(), logFormat),
    transports: [
        new winston.transports.MongoDB({
            level: "info",
            db: "mongodb://localhost:27017/board_log",
            options: {
                useUnifiedTopology: true,
            },
            collection: "logs",
            format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
            metaKey: "meta",
        }),
    ],
});
