module.exports = function(postbackUrl, sellerId, superagent, jwt) {  
  this.post = function(iat, exp, request, orderId, callback) {
    jwt.encode({
      iss: 'Google',
      aud: sellerId,
      typ: 'google/payments/inapp/item/v1/postback/buy',
      iat: iat,
      exp: exp,
      request: request,
      response: {
        orderId: orderId
      }
    }, function(err, encoded) {
      if (err) {
        callback(err, null);
      } else {
        superagent.post(postbackUrl).send({
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
