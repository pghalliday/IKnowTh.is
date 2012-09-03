module.exports = function(port) {
  var express = require('express'),
      http = require('http');
      
  var app = express();
  var server = http.createServer(app);

  this.start = function(callback) {
    server.listen(port, callback);
  };
  
  this.stop = function(callback) {
    server.close(callback);
  };
};
