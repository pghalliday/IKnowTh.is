module.exports = function(jwt, User, Event, Payment) {
  this.post = function(req, res) {
    var details = jwt.decode(req.body.jwt);
    var sellerData = JSON.parse(details.request.sellerData);
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
                Payment.process(event, user, details, function(error, payment) {
                  if (error) {
                    res.send(500, error.toString());
                  } else {
                    res.send(200, details.response.orderId);                  
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
