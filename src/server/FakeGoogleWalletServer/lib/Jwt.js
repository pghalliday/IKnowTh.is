module.exports = function(key) {
  var jwtSimple = require('jwt-simple');
  
  this.encode = function(payload, callback) {
    var error, token;
    try {
      token = jwtSimple.encode(payload, key);
    } catch(err) {
      error = err;
    }
    callback(error, token);
  };
  
  this.decode = function(token, callback) {
    var error, payload;
    try {
      payload = jwtSimple.decode(token, key);
    } catch(err) {
      error = err;
    }
    callback(error, payload);
  };
};