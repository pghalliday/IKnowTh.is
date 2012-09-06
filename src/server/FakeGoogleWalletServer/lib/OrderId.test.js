describe('OrderId', function() {
  var OrderId = require('./OrderId'),
      should = require('should');
      
  describe('#next', function() {
    it('should start at start ID and increment by 1 each time', function() {
      var orderId = new OrderId(10000);
      orderId.next().should.eql(10000);
      orderId.currentId.should.eql(10000);
      orderId.next().should.eql(10001);
      orderId.currentId.should.eql(10001);
      orderId.next().should.eql(10002);
      orderId.currentId.should.eql(10002);
    });
  });
});