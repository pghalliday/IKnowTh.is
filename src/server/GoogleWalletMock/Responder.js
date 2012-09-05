module.exports = function(jwt, response) {
  this.respond = function(requestData, callback) {
    if (requestData.jwt) {
      jwt.decode(requestData.jwt, function(err, decoded) {
        if (err) {
          response.error(null, 'MERCHANT_ERROR', function(response) {
            callback(500, response);
          });
        } else {
          if (decoded.request) {
          
          } else {
            response.error(null, 'MERCHANT_ERROR', function(response) {
              callback(500, response);
            });
          }
        }
      });
    } else {
      response.error(null, 'MERCHANT_ERROR', function(response) {
        callback(500, response);
      });
    }
  };
};
