describe('Response', function() {
  var Response = require('./Response'),
      should = require('should'),
      response = new Response();
      
  describe('#error', function() {
    it('should construct a valid error response body', function(done) {
      response.error('request', 'error', function(body) {
        body.should.eql({
          request: 'request',
          response: {
            errorType: 'error'
          }
        });
        done();
      });
    });
  });
  
  describe('#success', function() {
    it('should construct a valid success response body', function(done) {
      response.success('request', 'orderId', 'jwt', function(body) {
        body.should.eql({
          request: 'request',
          response: {
            orderId: 'orderId'
          },
          jwt: 'jwt'
        });
        done();
      });
    });
  });
});