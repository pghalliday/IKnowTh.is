module.exports = function(responder) {
  var express = require('express'),
      http = require('http'),
      app = express(),
      httpServer = http.createServer(app);
      
  app.use(express.bodyParser());

  app.post('/purchase', function(req, res) {
    responder.purchase(req.body, false, function(status, body) {
      res.send(status, body);
    });
  });

  app.post('/cancel', function(req, res) {
    responder.purchase(req.body, true, function(status, body) {
      res.send(status, body);
    });
  });

  app.post('/postback', function(req, res) {
    responder.postback(req.body, function(status, body) {
      res.send(status, body);
    });
  });
  
  this.start = function(port, callback) {
    httpServer.listen(port, function(err) {
      callback(err, httpServer);
    });
  };
  
  this.stop = function(callback) {
    httpServer.close(callback);
  };
};

