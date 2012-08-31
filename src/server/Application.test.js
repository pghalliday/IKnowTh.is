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
});
