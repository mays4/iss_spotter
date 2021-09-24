/**
 * Makes a single API request to retrieve the user's IP address.
 * Input:
 *   - A callback (to pass back an error or the IP string)
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The IP address as a string (null if error). Example: "162.245.144.188"
 */
const request = require('request');

// use request to fetch IP address from JSON API


const fetchMyIP = function(callback) {

  request('https://api.ipify.org?format=json',(err,res,body) => {
    // error can be set if invalid domain, user is offline, etc
    
    if (err) {
      callback(err,null);
      return;
    }
    // if non-200 status, assume server error
    if (res.statusCode !== 200) {
      const msg = `Status Code ${res.statusCode} when fetching IP. Response: ${body}`;
      callback(Error(msg), null);
      return;
    }
    // if we get here, all's well and we got the data
    // if (body[0].description) {
    const ip = JSON.parse(body).ip;
    callback(null, ip);
    
  });
};

const fetchCoordsByIP = function(ip,callback) {

  request(`https://freegeoip.app/json/${ip}`,(err,response,body) => {
    // error can be set if invalid domain, user is offline, etc
    
    if (err) {
      callback(err,null);
      return;
    }
    // if non-200 status, assume server error
    if (response.statusCode !== 200) {
      const msg = `Status Code ${response.statusCode} when fetching coordinates for IP. Response: ${body}`;
      callback(Error(msg), null);
      return;
    }
  
    // if we get here, all's well and we got the data
  
    const { latitude, longitude } = JSON.parse(body);
    callback(null, { latitude, longitude });
    
  });
};

const fetchISSFlyOverTimes = function(coords, callback) {
  //const  url =
  request(`https://iss-pass.herokuapp.com/json/?lat=${coords.latitude}&lon=${coords.longitude}`,(err,res,body) => {
    // error can be set if invalid domain, user is offline, etc
      
    if (err) {
      callback(err,null);
      return;
    }
    // if non-200 status, assume server error
    if (res.statusCode !== 200) {
      const msg = `Status Code ${res.statusCode} when fetching coordinates for IP. Response: ${body}`;
      callback(Error(msg), null);
      return;
    }
    
    // if we get here, all's well and we got the data
    
    const passes = JSON.parse(body).response;
    callback(null,passes);
      
  });
  
};
  
//module.exports = { fetchMyIP ,fetchCoordsByIP,fetchISSFlyOverTimes};
/**
 * Orchestrates multiple API requests in order to determine the next 5 upcoming ISS fly overs for the user's current location.
 * Input:
 *   - A callback with an error or results.
 * Returns (via Callback):
 *   - An error, if any (nullable)
 *   - The fly-over times as an array (null if error):
 *     [ { risetime: <number>, duration: <number> }, ... ]
 */
const nextISSTimesForMyLocation = function(callback) {

  fetchMyIP((error, ip) => {
    if (error) {
      return callback(error, null);
    }

    fetchCoordsByIP(ip, (error, loc) => {
      if (error) {
        return callback(error, null);
      }

      fetchISSFlyOverTimes(loc, (error, nextPasses) => {
        if (error) {
          return callback(error, null);
        }

        callback(null, nextPasses);
      });
    });
  });
};
  







module.exports = { nextISSTimesForMyLocation };