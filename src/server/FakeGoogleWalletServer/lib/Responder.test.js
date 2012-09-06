describe('Responder', function() {
  var Responder = require('./Responder'),
      Jwt = require('./Jwt'),
      OrderId = require('./OrderId'),
      jwtSimple = require('jwt-simple'),
      should = require('should');
      
  var jwt = new Jwt('secret'),
      orderId = new OrderId(10000);

  describe('#purchase', function() {
    it('should respond with status 500 and correct MERCHANT_ERROR response if the requestData is not an object with a jwt field', function(done) {
      var response = new Response(null, 'MERCHANT_ERROR');
      var responder = new Responder(jwt, response, orderId, postback);    
      responder.purchase('invalid request data', false, function(status, body) {
        status.should.eql(500);
        body.should.eql(response.body);
        done();
      });
    });
    
    it('should respond with status 500 and correct MERCHANT_ERROR response if the requestData jwt field cannot be decoded', function(done) {
      var response = new Response(null, 'MERCHANT_ERROR');
      var responder = new Responder(jwt, response, orderId, postback);
      responder.purchase({
        jwt: 'invalid jwt data'
      }, false, function(status, body) {
        status.should.eql(500);
        body.should.eql(response.body);
        done();
      });
    });
    
    it('should respond with status 500 and correct MERCHANT_ERROR response if the JWT does not contain a request field', function(done) {
      var response = new Response(null, 'MERCHANT_ERROR');
      var responder = new Responder(jwt, response, orderId, postback);
      responder.purchase({
        jwt: jwtSimple.encode({
          data: 'some data'
        }, 'secret')
      }, false, function(status, body) {
        status.should.eql(500);
        body.should.eql(response.body);
        done();
      });
    });

    it('should postback and respond with 200 and correct success body', function(done) {
      var response = new Response(null, null, orderId);
      var responder = new Responder(jwt, response, orderId, postback);    
      responder.purchase({
        jwt: jwtSimple.encode({
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
      var responder = new Responder(jwt, response, orderId, postback);    
      responder.purchase({
        jwt: jwtSimple.encode({
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
      var responder = new Responder(jwt, response, orderId, postback);    
      responder.purchase({
        jwt: jwtSimple.encode({
          request: 'valid request'
        }, 'secret')
      }, true, function(status, body) {
        status.should.eql(500);
        body.should.eql(response.body);
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
      id.should.be.eql(orderId.currentId);
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
