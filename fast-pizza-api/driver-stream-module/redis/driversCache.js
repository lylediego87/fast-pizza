 
  const writeToCache = (client, driverCode, newLocation) => {  
    return new Promise(async (resolve, reject) => {
      try {        
        await client.set(driverCode, newLocation);
        console.log(`write to cache ${newLocation}`);
        resolve("ok");
      } catch (error) {
        reject(error);
      }
    });
  }

module.exports = writeToCache;