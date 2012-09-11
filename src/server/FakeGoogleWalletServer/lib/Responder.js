module.exports = function(jwt, sellerId, response, orderId, postback, log) {
  var Request = require('./Request'),
      request = new Request(jwt, sellerId);

  this.purchase = function(body, cancel, callback) {
    request.parse(body, function(err, request, iat, exp) {
      if (err) {
        log.error(err);
        response.error(request, 'MERCHANT_ERROR', function(body) {
          callback(500, body);
        });
      } else {
        if (cancel) {
          response.error(request, 'PURCHASE_CANCELLED', function(body) {
            callback(500, body);
          });
        } else {
          var id = orderId.next();
          var now = Date.now();
          postback.post(iat, exp, request, id.toString(), function(err, postbackData) {
            if (err) {
              response.error(request, 'POSTBACK_ERROR', function(body) {
                callback(500, body);
              });
            } else {
              response.success(request, id.toString(), postbackData, function(body) {
                callback(200, body);
              });
            }
          });
        }
      }
    });
  };
  
  this.postback = function(request, callback) {
    if (request.jwt) {
      jwt.decode(request.jwt, function(err, decoded) {
        if (err) {
          callback(500, 'Invalid postback JWT');
        } else {
          if (decoded.response && decoded.response.orderId) {
            callback(200, decoded.response.orderId);
          } else {
            callback(500, 'Missing order ID');
          }
        }
      });
    } else {
      callback(500, 'Invalid postback');
    }
  };
};
