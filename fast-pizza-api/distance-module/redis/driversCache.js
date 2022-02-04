const { createClient } = require("redis");
const { map } = require('modern-async');

  const getDrivers = async (client) => {

    const keys = await client.sendCommand(["keys","*"]); 

    const drivers = await map(keys,  async (k) => {
      let val =  await client.get(k);
      const vals = val.split(',');    
      return {
        driverId: k,
        latitude: parseFloat(vals[0]),
        longitude: parseFloat(vals[1]),
      };
    });

    return drivers;
  }

module.exports = getDrivers;