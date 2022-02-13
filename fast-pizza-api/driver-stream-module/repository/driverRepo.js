require('dotenv').config();
require("colors");

const { MongoClient } = require("mongodb");
const cache = require('../redis/driversCache');

const readFromDb = async (onReceiveRecord) => {
  const client = new MongoClient("mongodb://root:password123@mongodb:27017");
  await client.connect();
  const db = client.db("fastpizzadb");

  const cursor = db.collection("drivers").find();
  let record;
  while((record = await cursor.next())){
    await onReceiveRecord(record);  
    sleep(200);
  }
}

const sleep = (milliseconds) => {
  const date = Date.now();
  let currentDate = null;
  do {
    currentDate = Date.now();
  } while (currentDate - date < milliseconds);
}

module.exports = readFromDb;