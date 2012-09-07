describe('Responder', function() {
  var Responder = require('./Responder'),
      Jwt = require('./Jwt'),
      OrderId = require('./OrderId'),
      jwtSimple = require('jwt-simple'),
      should = require('should');
      
  var jwt = new Jwt('secret'),
      orderId = new OrderId(10000);

  describe('#purchase', function() {
    it('should respond with status 500 and correct MERCHANT_ERROR response if the request body is not valid', function(done) {
      var response = new Response(null, 'MERCHANT_ERROR');
      var responder = new Responder(jwt, 'MySeller', response, orderId, postback);    
      responder.purchase('invalid request body', false, function(status, body) {
        status.should.eql(500);
        body.should.eql(response.body);
        done();
      });
    });

    it('should postback and respond with 200 and correct success body', function(done) {
      var response = new Response(null, null, orderId);
      var responder = new Responder(jwt, 'MySeller', response, orderId, postback);    
      responder.purchase({
        jwt: jwtSimple.encode({
          iss: 'MySeller',
          aud: 'Google',
          typ: 'google/payments/inapp/item/v1',
          iat: '123456789',
          exp: '987654321',
          request: 'valid request'
        }, 'secret')
      }, false, function(status, body) {
        status.should.eql(200);
        body.should.eql(response.body);
        done();
      });
    });
    
    it('should postback and respond with 500 and correct POSTBACK_ERROR response when postback fails', function(done) {
      var response = new Response({
        failPostback: true            
      }, 'POSTBACK_ERROR', orderId);
      var responder = new Responder(jwt, 'MySeller', response, orderId, postback);    
      responder.purchase({
        jwt: jwtSimple.encode({
          iss: 'MySeller',
          aud: 'Google',
          typ: 'google/payments/inapp/item/v1',
          iat: '123456789',
          exp: '987654321',
          request: {
            failPostback: true
          }
        }, 'secret')
      }, false, function(status, body) {
        status.should.eql(500);
        body.should.eql(response.body);
        done();
      });
    });
    
    it('should respond with 500 and correct PURCHASE_CANCELLED response if flagged to cancel', function(done) {
      var response = new Response('valid request', 'PURCHASE_CANCELLED', orderId);
      var responder = new Responder(jwt, 'MySeller', response, orderId, postback);    
      responder.purchase({
        jwt: jwtSimple.encode({
          iss: 'MySeller',
          aud: 'Google',
          typ: 'google/payments/inapp/item/v1',
          iat: '123456789',
          exp: '987654321',
          request: 'valid request'
        }, 'secret')
      }, true, function(status, body) {
        status.should.eql(500);
        body.should.eql(response.body);
        done();
      });
    });
  });

  describe('#postback', function() {
    it('should respond with 200 OK and the orderId if request is valid', function(done) {
      var responder = new Responder(jwt, null, null, null, null);    
      responder.postback({
        jwt: jwtSimple.encode({
          iss: 'Google',
          aud: 'MySeller',
          typ: 'google/payments/inapp/item/v1/postback/buy',
          iat: '123456789',
          exp: '987654321',
          request: 'valid request',
          response: {
            orderId: '10000'
          }
        }, 'secret')
      }, function(status, body) {
        status.should.eql(200);
        body.should.eql('10000');
        done();
      });
    });
    
    it('should respond with 500 error if request does not contain jwt field', function(done) {
      var responder = new Responder(jwt, null, null, null, null);    
      responder.postback({
        data: 'some data'
      }, function(status, body) {
        status.should.eql(500);
        body.should.eql('Invalid postback');
        done();
      });
    });
    
    it('should respond with 500 error if jwt field cannot be decoded', function(done) {
      var responder = new Responder(jwt, null, null, null, null);    
      responder.postback({
        jwt: jwtSimple.encode({
          iss: 'Google',
          aud: 'MySeller',
          typ: 'google/payments/inapp/item/v1/postback/buy',
          iat: '123456789',
          exp: '987654321',
          request: 'valid request',
          response: {
            orderId: '10000'
          }
        }, 'wrong secret')
      }, function(status, body) {
        status.should.eql(500);
        body.should.eql('Invalid postback JWT');
        done();
      });
    });
    
    it('should respond with 500 error if JWT does not contain an order ID', function(done) {
      var responder = new Responder(jwt, null, null, null, null);    
      responder.postback({
        jwt: jwtSimple.encode({
          iss: 'Google',
          aud: 'MySeller',
          typ: 'google/payments/inapp/item/v1/postback/buy',
          iat: '123456789',
          exp: '987654321',
          request: 'valid request'
        }, 'secret')
      }, function(status, body) {
        status.should.eql(500);
        body.should.eql('Missing order ID');
        done();
      });
    });
  });

  var Response = function(expectedRequest, expectedError, orderId) {
    this.error = function(request, error, callback) {
      if (expectedRequest) {
        expectedRequest.should.eql(request);
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
      id.should.be.eql(orderId.currentId.toString());
      postbackData.should.be.eql(postback.data);
      this.body = {
        request: request,
        orderId: id,
        postbackData: postbackData
      };
      callback(this.body);
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
