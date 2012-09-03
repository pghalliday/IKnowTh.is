describe('GoogleWalletMock', function() {
  var GoogleWalletMock = require('./GoogleWalletMock.js');
  
  var googleWalletMock;
  
  before(function(done) {
    googleWalletMock = new GoogleWalletMock(8000);
    googleWalletMock.start(done);
  });
  
  after(function(done) {
    googleWalletMock.stop(done);
  });
  
  describe('GET /purchase', function() {
    it('should respond to get request on route /purchase', function(done) {
      done();
    });
  });
});
