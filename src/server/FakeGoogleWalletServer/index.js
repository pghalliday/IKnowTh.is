module.exports = function(port, sellerId, key, postbackUrl, startId) {
  var Server = require('./lib/Server'),
      Responder = require('./lib/Responder'),
      Jwt = require('./lib/Jwt'),
      Response = require('./lib/Response'),
      OrderId = require('./lib/OrderId'),
      Postback = require('./lib/Postback'),
      Log = require('./lib/Log'),
      superagent = require('superagent');
      
  var jwt = new Jwt(key),
      response = new Response(),
      orderId = new OrderId(startId),
      postback = new Postback(postbackUrl, sellerId, superagent, jwt),
      log = new Log(console),
      responder = new Responder(jwt, sellerId, response, orderId, postback, log),
      server = new Server(responder);
  
  this.start = function(callback) {
    server.start(port, callback);
  };
  
  this.stop = function(callback) {
    server.stop(callback);
  };
};
