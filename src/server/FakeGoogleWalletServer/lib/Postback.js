module.exports = function(postbackUrl, aud, request, jwt) {  
  this.post = function(iat, exp, requestData, orderId, callback) {
    jwt.encode({
      iss: 'Google',
      aud: aud,
      typ: 'google/payments/inapp/item/v1/postback/buy',
      iat: iat,
      exp: exp,
      request: requestData,
      response: {
        orderId: orderId
      }
    }, function(err, encoded) {
      if (err) {
        callback(err, null);
      } else {
        request.post(postbackUrl).send({
          jwt: encoded
        }).end(function(res) {
          if (res.ok && res.text === orderId) {
            callback(null, encoded);
          } else {
            callback(new Error('Postback failed'), null);
          }
        });
      }
    });
  };
};
