module.exports = function(jwt, User, Event, Payment) {
  this.post = function(req, res) {
    var details = jwt.decode(req.body);
    var sellerData = JSON.parse(details.request.sellerData);
    User.findById(sellerData.userId, function(error, user) {
      Event.findById(sellerData.eventId, function(error, event) {
        Payment.process(event, user, details, function(error, payment) {
          res.send(200, details.response.orderId);
        });
      });
    });
  };
};
