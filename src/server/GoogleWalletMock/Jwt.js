module.exports = function(key, encoder) {
  this.encode = function(payload, callback) {
    var error, token;
    try {
      token = encoder.encode(payload, key);
    } catch(err) {
      error = err;
    }
    callback(error, token);
  };
  
  this.decode = function(token, callback) {
    var error, payload;
    try {
      payload = encoder.decode(token, key);
    } catch(err) {
      error = err;
    }
    callback(error, payload);
  };
};