const NodeGeocoder = require('node-geocoder');

  const apiKey =  "AIzaSyAklMUtI36qhngpcVZCAYwrGRdnyO0FCh0";
  const geocodeOptions = {
    provider: 'google',
    apiKey: apiKey, 
    formatter: null 
  };  

  const getCoordinates = async (placeName) => {        
    return new Promise(async (resolve, reject) => {
      const geocoder = NodeGeocoder(geocodeOptions);      
      const response = await geocoder.geocode(placeName);
      resolve(response);
    });
  }

module.exports = getCoordinates;