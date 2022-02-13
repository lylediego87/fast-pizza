const getDrivers = require('./redis/driversCache');


// Converts numeric degrees to radians
toRad = (Value) => {
  return Value * Math.PI / 180;
}


// Calculate the distance between two points in km
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  var R = 6371; 
  var dLat = toRad(lat2-lat1);
  var dLon = toRad(lon2-lon1);
  var lat1 = toRad(lat1);
  var lat2 = toRad(lat2);

  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c;
  return d;
}

const getNearestDriver = async (redisClient,userLocation) => {
    const drivers = await getDrivers(redisClient);
    const nearestDriver = drivers.map(driver => {  
      const distance = calculateDistance(userLocation.latitude, userLocation.longitude, driver.latitude, driver.longitude);            
      return {
        driverId: driver.driverId,
        distance: distance,
        latitude: driver.latitude,
        longitude: driver.longitude
      };
    }).sort((a,b) => a.distance - b.distance)[0];           
    return nearestDriver;
  }

  const getClosestDrivers = async (redisClient,userLocation,size) => {
    const drivers = await getDrivers(redisClient);
    const nearestDriver = drivers.map(driver => {  
      const distance = calculateDistance(userLocation.latitude, userLocation.longitude, driver.latitude, driver.longitude);            
      return {
        driverId: driver.driverId,
        distance: distance,
        latitude: driver.latitude,
        longitude: driver.longitude
      };
    }).sort((a,b) => a.distance - b.distance).slice(0,size);           
    return nearestDriver;
  }

module.exports = {calculateDistance, getNearestDriver, getClosestDrivers};