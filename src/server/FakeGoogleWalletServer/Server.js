module.exports = function(responder) {
  var express = require('express');
  this.app = express();
      
  this.app.use(express.bodyParser());

  this.app.post('/purchase', function(req, res) {
    responder.purchase(req.body, function(status, body) {
      res.send(status, body);
    });
  });

  this.app.post('/cancel', function(req, res) {
    responder.cancel(req.body, function(status, body) {
      res.send(status, body);
    });
  });
};

