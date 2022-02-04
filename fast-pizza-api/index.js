const express = require('express');
const { createClient } = require("redis");
const { v4: uuidv4 } = require('uuid');
const app = express();
const server =  require('http').createServer(app);
const WebSocket = require('ws');
const wss = new WebSocket.Server({server: server});
const getCoordinates = require('./geocoder/geocoder');
const distance = require('./distance-module/distance');
const stream = require('./driver-stream-module/driverStream');

const clients = new Map();
const redisClient = createClient({url: 'redis://drivers-cache:6379'});

wss.on('connection', function connection(ws){
  console.log('A client connected');  

  ws.on('message', async function message(raw){    
    const data = JSON.parse(raw);
    const place = await getCoordinates(data);    
    const clientId = uuidv4(); 
    
    userLocation = {
      latitude: place[0].latitude,
      longitude: place[0].longitude
    };

    const nearestDriver = await distance.getNearestDriver(redisClient,userLocation);
    
    const client = {
      id: clientId, 
      socket: ws,      
      userLocation: userLocation,           
    };

    const payload = {
      id: clientId,         
      placeName: data.placeName,      
      userLocation: userLocation,      
      nearestDriver: nearestDriver
    };

    clients.set(clientId, client);          
    ws.send(JSON.stringify(payload));   
  });  
});

server.listen(3000, () => {
  stream();
  console.log('Listening on port 3000')
});

const poll = () => {  
  if(clients.size > 0){    
    clients.forEach( async(x) => {
      x.nearestDriver = await distance.getNearestDriver(redisClient, x.userLocation);   
      
      const payload = {
        id: x.clientId,         
        placeName: x.placeName,        
        userLocation: x.userLocation,      
        nearestDriver: x.nearestDriver
      };
      
      x.socket.send(JSON.stringify(payload));
    }); 
  } 
  setTimeout(poll, 1000 * 10);
}

const connectRedis = async () => {  
  await redisClient.connect();              
}

connectRedis();
poll();
