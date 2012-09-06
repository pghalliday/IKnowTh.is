module.exports = function(responder) {
  var express = require('express');
  this.app = express();
      
  this.app.use(express.bodyParser());

  this.app.post('/purchase', function(req, res) {
    responder.purchase(req.body, function(status, body) {
      res.send(status, body);
    });
  });

  this.app.post('/purchaseCancel', function(req, res) {
    responder.purchaseCancel(req.body, function(status, body) {
      res.send(status, body);
    });
  });
};

