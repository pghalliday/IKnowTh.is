describe('GoogleWalletMock', function() {
  var app = require('./GoogleWalletMock.js'),
      request = require('supertest');
  
  describe('GET /', function() {
    it('should respond with 200 OK to get request on route /', function(done) {
      request(app).get('/').expect(200, done);
    });
  });
});
