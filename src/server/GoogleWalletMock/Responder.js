module.exports = function(jwt, response, orderId, postback) {
  this.respond = function(requestData, callback) {
    if (requestData.jwt) {
      jwt.decode(requestData.jwt, function(err, decoded) {
        if (err) {
          response.error(null, 'MERCHANT_ERROR', function(body) {
            callback(500, body);
          });
        } else {
          if (decoded.request) {
            orderId.next(function(err, id) {
              if (err) {
                response.error(decoded.request, 'INTERNAL_SERVER_ERROR', function(body) {
                  callback(500, body);
                });
              } else {
                postback.post(decoded, id, function(err, postbackData) {
                  if (err) {
                    response.error(decoded.request, 'POSTBACK_ERROR', function(body) {
                      callback(500, body);
                    });
                  } else {
                    response.success(decoded.request, id, postbackData, function(body) {
                      callback(200, body);
                    });
                  }
                });
              }
            });
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
