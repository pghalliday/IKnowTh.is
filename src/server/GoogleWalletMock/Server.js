module.exports = function(responder) {
  var express = require('express');
  this.app = express();
      
  this.app.use(express.bodyParser());

  this.app.post('/', function(req, res) {
    responder.respond(req.body, function(status, body) {
      res.send(status, body);
    });
  });
};

