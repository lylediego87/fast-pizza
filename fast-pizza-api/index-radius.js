const express = require('express');
const { createClient } = require("redis");
const app = express();
var cors = require('cors')
app.use(cors());

const stream = require('./driver-stream-module/driverStream');
const getCoordinates = require('./geocoder/geocoder');
const distance = require('./distance-module/distance');
const redisClient = createClient({url: 'redis://drivers-cache:6379'});

app.get('/radius', async function (req, res) {
 
  const place = await getCoordinates(req.query.place);    

  userLocation = {
    latitude: place[0].latitude,
    longitude: place[0].longitude
  };

  const nearestDriver = await distance.getClosestDrivers(redisClient,userLocation, 5);

  res.send({
    user: userLocation,
    drivers: nearestDriver
  })  
})

app.listen(3000, () => {
  connectRedis();
  stream();
  console.log('Listening on port 3000')
});

const connectRedis = async () => {  
  await redisClient.connect();              
}
