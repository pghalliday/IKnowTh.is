describe('Responder', function() {
  var Responder = require('./Responder');

  var responseBuilt;
  var jwtDecoded;
  
  var response = {
    error: function(request, error, callback) {
      error.should.eql('MERCHANT_ERROR');
      responseBuilt = true;
      callback({
        request: request,
        error: error
      });
    }
  };

  var jwt = {
    decode: function(encoded, callback) {
      jwtDecoded = true;
      if (encoded.decoded) {
        callback(null, encoded.decoded);
      } else {
        callback(new Error('Invalid JWT'), null);
      }
    }
  };

  var orderId = {
    next: function(callback) {
      callback('orderId');
    },
    last: function() {
      return 'orderId';
    }
  };

  var postback = {
    post: function(aud, request, id, callback) {
      aud.should.be.eql('MySeller');
      request.should.be.eql('valid request');
      id.should.be.eql(orderId.last());
      callback(null, 'encoded jwt');
    }
  };

  it('should respond with status 500 and correct MERCHANT_ERROR response if the requestData is not an object with a jwt field', function(done) {
    responseBuilt = false;
    jwtDecoded = false;
    var responder = new Responder(jwt, response);    
    responder.respond('invalid request data', function(status, body) {
      responseBuilt.should.eql(true);
      jwtDecoded.should.eql(false);
      status.should.eql(500);
      body.should.eql({
        request: null,
        error: 'MERCHANT_ERROR'
      });
      done();
    });
  });
  
  it('should respond with status 500 and correct MERCHANT_ERROR response if the requestData jwt field cannot be decoded', function(done) {
    responseBuilt = false;
    jwtDecoded = false;
    var responder = new Responder(jwt, response);    
    responder.respond({
      jwt: 'invalid jwt data'
    }, function(status, body) {
      responseBuilt.should.eql(true);
      jwtDecoded.should.eql(true);
      status.should.eql(500);
      body.should.eql({
        request: null,
        error: 'MERCHANT_ERROR'
      });
      done();
    });
  });
  
  it('should respond with status 500 and correct MERCHANT_ERROR response if the JWT does not contain a request field', function(done) {
    responseBuilt = false;
    jwtDecoded = false;
    var responder = new Responder(jwt, response);    
    responder.respond({
      jwt: {
        decoded: 'invalid decoded data'
      }
    }, function(status, body) {
      responseBuilt.should.eql(true);
      jwtDecoded.should.eql(true);
      status.should.eql(500);
      body.should.eql({
        request: null,
        error: 'MERCHANT_ERROR'
      });
      done();
    });
  });

  it('should postback with correctly constructed JWT', function(done) {
    responseBuilt = false;
    jwtDecoded = false;
    var responder = new Responder(jwt, response, orderId, postback);    
    responder.respond({
      jwt: {
        decoded: {
          request: 'valid request'
        }
      }
    }, function(status, body) {
      /* TODO */
      done();
    });
  });
});
