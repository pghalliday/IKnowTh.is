describe('OrderId', function() {
  var OrderId = require('./OrderId'),
      should = require('should');
      
  describe('#next', function() {
    it('should start at start ID and increment by 1 each time', function(done) {
      var orderId = new OrderId(10000);
      orderId.next(function(id) {
        id.should.be.eql(10000);
        orderId.next(function(id) {
          id.should.be.eql(10001);
          orderId.next(function(id) {
            id.should.be.eql(10002);
            done();
          });
        });
      });
    });
  });
});