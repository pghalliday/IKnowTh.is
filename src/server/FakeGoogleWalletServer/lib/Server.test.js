describe('Server', function() {
  var Server = require('./Server'),
      should = require('should'),
      supertest = require('supertest');

  var requestBody = {body: 'my request'};
  var postbackRequestBody = {body: 'my postback request'};
  var responseStatus = 201;
  var cancelResponseStatus = 501;
  var postbackResponseStatus = 202;
  var responseBody = 'my response';
  var cancelResponseBody = 'my cancel response';
  var postbackResponseBody = 'my postback response';
  
  var responder = {
    purchase: function(data, cancel, callback) {
      data.should.eql(requestBody);
      if (cancel) {
        callback(cancelResponseStatus, cancelResponseBody);
      } else {
        callback(responseStatus, responseBody);
      }
    },
    postback: function(data, callback) {
      data.should.eql(postbackRequestBody);
      callback(postbackResponseStatus, postbackResponseBody);
    }
  };
  
  var server = new Server(responder);
  var app;

  before(function(done) {
    server.start(3002, function(err, httpServer) {
      app = httpServer;
      done(err);
    });
  });

  after(function(done) {
    server.stop(done);
  });

  describe('POST /purchase', function() {
    it('should use purchase method to process requests correctly', function(done) {
      supertest(app).post('/purchase').send(requestBody).expect(responseStatus, responseBody, done);
    });
  });
  
  describe('POST /cancel', function() {
    it('should use purchase method to process cancelled requests correctly', function(done) {
      supertest(app).post('/cancel').send(requestBody).expect(cancelResponseStatus, cancelResponseBody, done);
    });
  });
  
  describe('POST /postback', function() {
    it('should use postback method to process requests correctly', function(done) {
      supertest(app).post('/postback').send(postbackRequestBody).expect(postbackResponseStatus, postbackResponseBody, done);
    });
  });
});
