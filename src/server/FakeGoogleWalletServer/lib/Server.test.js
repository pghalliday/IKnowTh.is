describe('Server', function() {
  var Server = require('./Server'),
      should = require('should'),
      supertest = require('supertest');

  var requestBody = {body: 'my request'};
  var responseStatus = 201;
  var cancelResponseStatus = 501;
  var responseBody = 'my response';
  var cancelResponseBody = 'my cancel response';
  var responded;
  
  var responder = {
    purchase: function(data, cancel, callback) {
      responded = true;
      data.should.eql(requestBody);
      if (cancel) {
        callback(cancelResponseStatus, cancelResponseBody);
      } else {
        callback(responseStatus, responseBody);
      }
    }
  };
  
  var server = new Server(responder);

  describe('POST /purchase', function() {
    it('should use purchase method to process requests correctly', function(done) {
      responded = false;
      supertest(server.app).post('/purchase').send(requestBody).expect(responseStatus, responseBody, function(err) {
        responded.should.eql(true);
        done(err);
      });
    });
  });
  
  describe('POST /cancel', function() {
    it('should use purchase method to process cancelled requests correctly', function(done) {
      responded = false;
      supertest(server.app).post('/cancel').send(requestBody).expect(cancelResponseStatus, cancelResponseBody, function(err) {
        responded.should.eql(true);
        done(err);
      });
    });
  });
  
  describe('POST /postback', function() {
    it('should use postback method to process requests correctly', function(done) {
      responded = false;
      supertest(server.app).post('/postback').send(postbackBody).expect(cancelResponseStatus, cancelResponseBody, function(err) {
        responded.should.eql(true);
        done(err);
      });
    });
  });
});
