describe('Server', function() {
  var Server = require('./Server'),
      should = require('should'),
      request = require('supertest');

  var requestBody = {body: 'my request'};
  var responseStatus = 201;
  var cancelResponseStatus = 501;
  var responseBody = 'my response';
  var cancelResponseBody = 'my cancel response';
  var responded;
  
  var responder = {
    purchase: function(data, callback) {
      responded = true;
      data.should.eql(requestBody);
      callback(responseStatus, responseBody);
    },
    purchaseCancel: function(data, callback) {
      responded = true;
      data.should.eql(requestBody);
      callback(cancelResponseStatus, cancelResponseBody);
    }
  };
  
  var server = new Server(responder);

  describe('POST /purchase', function() {
    it('should use purchase method to process requests correctly', function(done) {
      responded = false;
      request(server.app).post('/purchase').send(requestBody).expect(responseStatus, responseBody, function(err) {
        responded.should.eql(true);
        done(err);
      });
    });
  });
  
  describe('POST /purchaseCancelled', function() {
    it('should use purchaseCancel method to process requests correctly', function(done) {
      responded = false;
      request(server.app).post('/purchaseCancel').send(requestBody).expect(cancelResponseStatus, cancelResponseBody, function(err) {
        responded.should.eql(true);
        done(err);
      });
    });
  });
});
