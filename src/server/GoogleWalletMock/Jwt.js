module.exports = function(key, encoder) {
  this.encode = function(payload, callback) {
    try {
      callback(null, encoder.encode(payload, key));
    } catch(err) {
      callback(err, null);
    }
  };
  
  this.decode = function(token, callback) {
    try {
      callback(null, encoder.decode(token, key));
    } catch(err) {
      callback(err, null);
    }
  };
};