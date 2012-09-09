module.exports = function(secret, User, Event, Payment) {
  var jwtSimple = require('jwt-simple');
  this.post = function(req, res) {
    var payload = jwtSimple.decode(req.body.jwt, secret);
    var sellerData = JSON.parse(payload.request.sellerData);
    User.findById(sellerData.userId, function(error, user) {
      if (error) {
        res.send(500, error.toString());
      } else {
        if (user) {
          Event.findById(sellerData.eventId, function(error, event) {
            if (error) {
              res.send(500, error.toString());
            } else {
              if (event) {
                Payment.process(event, user, payload, function(error, payment) {
                  if (error) {
                    res.send(500, error.toString());
                  } else {
                    res.send(200, payload.response.orderId);                  
                  }
                });
              } else {
                res.send(500, 'Event does not exist');
              }
            }
          });
        } else {
          res.send(500, 'User does not exist');
        }
      }
    });
  };
};
