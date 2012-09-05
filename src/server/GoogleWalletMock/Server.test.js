describe('Server', function() {
  var Server = require('./Server'),
      request = require('supertest');

  var requestBody = {body: 'my request'};
  var responseStatus = 201;
  var responseBody = 'my response';
  var responded = false;
  
  var responder = {
    respond: function(data, callback) {
      responded = true;
      data.should.eql(requestBody);
      callback(responseStatus, responseBody);
    }
  };
  
  var server = new Server(responder);

  describe('POST /', function() {
    it('should use respond method to process requests correctly', function(done) {
      request(server.app).post('/').send(requestBody).expect(responseStatus, responseBody, function(err) {
        responded.should.eql(true);
        done(err);
      });
    });
  });
});
