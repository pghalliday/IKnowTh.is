describe('Responder', function() {
  var Responder = require('./Responder'),
      should = require('should');

  it('should respond with status 500 and correct MERCHANT_ERROR response if the requestData is not an object with a jwt field', function(done) {
    var response = new Response(null, 'MERCHANT_ERROR');
    var responder = new Responder(jwt, response);    
    responder.respond('invalid request data', function(status, body) {
      status.should.eql(500);
      body.should.eql(response.body);
      done();
    });
  });
  
  it('should respond with status 500 and correct MERCHANT_ERROR response if the requestData jwt field cannot be decoded', function(done) {
    var response = new Response(null, 'MERCHANT_ERROR');
    var responder = new Responder(jwt, response);    
    responder.respond({
      jwt: 'invalid jwt data'
    }, function(status, body) {
      status.should.eql(500);
      body.should.eql(response.body);
      done();
    });
  });
  
  it('should respond with status 500 and correct MERCHANT_ERROR response if the JWT does not contain a request field', function(done) {
    var response = new Response(null, 'MERCHANT_ERROR');
    var responder = new Responder(jwt, response);    
    responder.respond({
      jwt: {
        decoded: 'invalid decoded data'
      }
    }, function(status, body) {
      status.should.eql(500);
      body.should.eql(response.body);
      done();
    });
  });

  it('should respond with status 500 and correct INTERNAL_SERVER_ERROR response if an order ID cannot be assigned', function(done) {
    var orderId = new OrderId(true);
    var response = new Response('valid request', 'INTERNAL_SERVER_ERROR');
    var responder = new Responder(jwt, response, orderId);    
    responder.respond({
      jwt: {
        decoded: {
          request: 'valid request'
        }
      }
    }, function(status, body) {
      status.should.eql(500);
      body.should.eql(response.body);
      done();
    });
  });

  it('should postback and respond with 200 and correct success body', function(done) {
    var orderId = new OrderId(false);
    var response = new Response(null, null, orderId);
    var responder = new Responder(jwt, response, orderId, postback);    
    responder.respond({
      jwt: {
        decoded: {
          request: 'valid request'
        }
      }
    }, function(status, body) {
      status.should.eql(200);
      body.should.eql(response.body);
      done();
    });
  });
  
  it('should postback and respond with 500 and correct POSTBACK_ERROR response when postback fails', function(done) {
    var orderId = new OrderId(false);
    var response = new Response('valid request', 'POSTBACK_ERROR', orderId);
    var responder = new Responder(jwt, response, orderId, postback);    
    responder.respond({
      jwt: {
        decoded: {
          request: {
            failPostback: true            
          }
        }
      }
    }, function(status, body) {
      status.should.eql(500);
      body.should.eql(response.body);
      done();
    });
  });


  var Response = function(expectedRequest, expectedError, orderId) {
    this.error = function(request, error, callback) {
      if (expectedRequest) {
        expectedRequest.should.be.eql(expectedRequest);
      } else {
        should.not.exist(request);
      }
      error.should.be.eql(expectedError);
      this.body = {
        request: request,
        error: error
      };
      callback(this.body);
    };
    
    this.success = function(request, id, postbackData, callback) {
      request.should.be.eql('valid request');
      id.should.be.eql(orderId.current);
      postbackData.should.be.eql(postback.data);
      this.body = {
        request: request,
        orderId: id,
        postbackData: postbackData
      };
      callback(this.body);
    };
  };

  var jwt = {
    decode: function(encoded, callback) {
      if (encoded.decoded) {
        callback(null, encoded.decoded);
      } else {
        callback(new Error('Invalid JWT'), null);
      }
    },
    encode: function(decoded, callback) {
      callback(null, {
        decoded: decoded
      });
    }
  };

  var OrderId = function(fail) {
    this.next = function(callback) {
      if (fail) {
        callback(new Error('Cannot assign order ID'), null);
      } else {
        this.current = 'orderId';
        callback(null, this.current);
      }
    };
  };

  var postback = {
    post: function(iat, exp, requestData, orderId, callback) {
      var self = this;
      if (requestData.failPostback) {
        callback(new Error('Postback failed'), null);
      } else {
        jwt.encode({
          iat: iat,
          exp: exp,
          requestData: requestData,
          orderId: orderId
        }, function(err, encoded) {
          self.data = encoded;
          callback(null, self.data);
        });
      }
    }
  };
});
