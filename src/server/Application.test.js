describe('Application', function() {
  var Application = require('./Application.js');
  
  var application;
  
  before(function(done) {
    application = new Application();
    application.start(done);
  });
  
  after(function(done) {
    application.stop(done);
  });
  
  describe('GET something', function() {
    it('should respond to get request', function(done) {
      done();
    });
  });
});
