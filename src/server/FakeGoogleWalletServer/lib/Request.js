module.exports = function(jwt, sellerId) {
  this.parse = function(body, callback) {
    if (body) {
      if (body.jwt) {
        jwt.decode(body.jwt, function(err, decoded) {
          if (err) {
            callback(new Error('Jwt field cannot be decoded'));
          } else {
            if (decoded.request) {
              if (decoded.iat) {
                if (decoded.exp) {
                  if (decoded.typ === 'google/payments/inapp/item/v1') {
                    if (decoded.aud === 'Google') {
                      if (decoded.iss === sellerId) {
                        callback(null, decoded.request, decoded.iat, decoded.exp);
                      } else {
                        callback(new Error('Decoded JWT does not have iss field equal to sellerId'), decoded.request, decoded.iat, decoded.exp);
                      }
                    } else {
                      callback(new Error('Decoded JWT does not have aud field equal to "Google"'), decoded.request, decoded.iat, decoded.exp);
                    }
                  } else {
                    callback(new Error('Decoded JWT does not have typ field equal to "google/payments/inapp/item/v1"'), decoded.request, decoded.iat, decoded.exp);
                  }                
                } else {
                  callback(new Error('Decoded JWT does not contain an exp field'), decoded.request, decoded.iat, decoded.exp);
                }
              } else {
                callback(new Error('Decoded JWT does not contain an iat field'), decoded.request, decoded.iat, decoded.exp);
              }
            } else {
              callback(new Error('Decoded JWT does not contain a request field'), decoded.request, decoded.iat, decoded.exp);
            }
          }
        });
      } else {
        callback(new Error('Body has no jwt field'));
      }
    } else {
      callback(new Error('No body supplied'));
    }
  };
};
