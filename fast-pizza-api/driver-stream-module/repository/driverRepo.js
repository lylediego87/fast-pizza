require('dotenv').config();
require("colors");

const { MongoClient } = require("mongodb");
const cache = require('../redis/driversCache');

const readFromDb = async (onReceiveRecord) => {
  const client = new MongoClient("mongodb://root:password123@mongodb:27017");
  await client.connect();
  const db = client.db("fastpizzadb");

  const cursor = db.collection("drivers").find();
  cursor.stream().on('data', onReceiveRecord);  
}

module.exports = readFromDb;