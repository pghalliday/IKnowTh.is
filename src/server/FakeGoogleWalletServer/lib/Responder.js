module.exports = function(jwt, sellerId, response, orderId, postback) {
  this.purchase = function(requestData, cancel, callback) {
    if (requestData.jwt) {
      jwt.decode(requestData.jwt, function(err, decoded) {
        if (err) {
          response.error(null, 'MERCHANT_ERROR', function(body) {
            callback(500, body);
          });
        } else {
          if (decoded.request && decoded.iat && decoded.exp && decoded.aud === 'Google' && decoded.iss === sellerId && decoded.typ === 'google/payments/inapp/item/v1') {
            if (cancel) {
              response.error(decoded.request, 'PURCHASE_CANCELLED', function(body) {
                callback(500, body);
              });
            } else {
              var id = orderId.next();
              var now = Date.now();
              postback.post(decoded.iat, decoded.exp, decoded.request, id.toString(), function(err, postbackData) {
                if (err) {
                  response.error(decoded.request, 'POSTBACK_ERROR', function(body) {
                    callback(500, body);
                  });
                } else {
                  response.success(decoded.request, id.toString(), postbackData, function(body) {
                    callback(200, body);
                  });
                }
              });
            }
          } else {
            response.error(null, 'MERCHANT_ERROR', function(body) {
              callback(500, body);
            });
          }
        }
      });
    } else {
      response.error(null, 'MERCHANT_ERROR', function(body) {
        callback(500, body);
      });
    }
  };
};
