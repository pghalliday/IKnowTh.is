describe('log', function() {
  var Log = require('./Log');
  var should = require('should');

  describe('#error', function() {
    it('should toString the error and print it in the console', function() {
      var log = new Log(fakeConsole);
      log.error(new Error('this is a test'));
      should.exist(fakeConsole.message, 'message should have been sent to fake console');
      fakeConsole.message.should.eql((new Error('this is a test')).toString());
    });
  });

  var fakeConsole = {
    log: function(message) {
      this.message = message;
    }
  };
});