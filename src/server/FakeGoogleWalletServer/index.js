module.exports = function(port, sellerId, key, postbackUrl, startId) {
  var Server = require('./lib/Server'),
      Responder = require('./lib/Responder'),
      Jwt = require('./lib/Jwt'),
      Response = require('./lib/Response'),
      OrderId = require('./lib/OrderId'),
      Postback = require('./lib/Postback'),
      superagent = require('superagent'),
      http = require('http');
      
  var jwt = new Jwt(key),
      response = new Response(),
      orderId = new OrderId(startId),
      postback = new Postback(postbackUrl, sellerId, superagent, jwt),
      responder = new Responder(jwt, sellerId, response, orderId, postback),
      server = new Server(responder);
  
  this.start = function(callback) {
    server.start(port, function(err, httpServer) {
      callback(err, httpServer);
    });
  };
  
  this.stop = function(callback) {
    server.stop(callback);
  };
};
