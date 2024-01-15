const { MongoClient } = require("mongodb");
const mongodbConfig = require("../config/mongodbConfig");

const clientSession = new MongoClient("mongodb://localhost:27017", mongodbConfig);
clientSession.connect();

module.exports = clientSession.db(process.env.DB_MONGO_SESSION).collection(process.env.DB_MONGO_SESSION_COLLECTION);
