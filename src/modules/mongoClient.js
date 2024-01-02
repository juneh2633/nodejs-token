const { MongoClient } = require("mongodb");
const mongodbConfig = require("../config/mongodbConfig");

const client = new MongoClient("mongodb://localhost:27017", mongodbConfig);
client.connect();
module.exports = client;
