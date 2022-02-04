const { createClient } = require("redis");

const writeToCache = require("./redis/driversCache");
const readFromDb = require("./repository/driverRepo");

const redisClient = createClient({url: 'redis://drivers-cache:6379'});

const onReceiveRecord = async (record) => {    
  const location = `${record.latitude}, ${record.longitude}`;        
  await writeToCache(redisClient, record.driverId, location);
}

const stream = async () => {
  await redisClient.connect();
  readFromDb(onReceiveRecord);  
}

module.exports = stream;