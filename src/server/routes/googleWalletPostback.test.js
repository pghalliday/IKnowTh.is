describe('GoogleWalletPostback', function() {
  var GoogleWalletPostback = require('./googleWalletPostback.js');
 
  describe('#post()', function() {
    it('should repond with 200 OK and the order ID if the payment can be processed', function(done) {

      // flags and stuff so we can verify that the payment was actually processed
      var paymentProcessed = false,
          foundUser,
          foundEvent;

      // define a mock JWT object
      var mockJwt = {
        encode: function(decoded) {
          return {object: decoded};
        },
        decode: function(encoded) {
          return encoded.object;
        }
      };
 
      // define a mock request object
      var mockRequest = {
        body: mockJwt.encode({ 
          iss: 'Google',
          aud: '1337133713371337',
          typ: 'google/payments/inapp/item/v1/postback/buy',
          iat: '1309988959',
          exp: '1409988959',
          request: {
            name: 'Piece of Cake',
            description: 'Virtual chocolate cake to fill your virtual tummy',
            price: '10.50',
            currencyCode: 'USD',
            sellerData: '{"userId":123,"eventId":789}'
          },
          response: {
            orderId: '1234567890'
          }
        })
      };
         
      // define a mock user table
      var MockUser = function(_id) {
        _id.should.eql(123);
        this._id = _id;
      };
      MockUser.findById = function(_id, callback) {
        foundUser = new MockUser(_id);
        callback(null, foundUser);
      };

      // define a mock event table
      var MockEvent = function(_id) {
        _id.should.eql(789);
        this._id = _id;
      };
      MockEvent.findById = function(_id, callback) {
         foundEvent = new MockEvent(_id);
         callback(null, foundEvent);
      };
    
      // define a mock payment table
      var MockPayment = function() {
      };
      MockPayment.process = function(event, attendee, details, callback) {
        event.should.equal(foundEvent, 'should be processing payment for correct event');
        attendee.should.eql(foundUser, 'should be processing payment for correct attendee');
        details.request.name.should.eql('Piece of Cake', 'should be processing payment for correct request');
        paymentProcessed = true;
        callback(null, new MockPayment());
      };
      
      // define a mock response object
      var mockResponse = {
        send: function(status, body) {
          paymentProcessed.should.eql(true, 'payment should have been processed');
          status.should.eql(200, 'response status should be 200');
          body.should.eql('1234567890', 'should have the correct order id');
          done();
        }
      };
      
      var googleWalletPostback = new GoogleWalletPostback(mockJwt, MockUser, MockEvent, MockPayment);      
      googleWalletPostback.post(mockRequest, mockResponse);
    });
    
    it('should repond with 500 error and error mesage if the payment cannot be processed as the user is unknown', function(done) {
      /* TODO */
      done();
    });
    
    it('should repond with 500 error and error mesage if the payment cannot be processed as the event is unknown', function(done) {
      /* TODO */
      done();
    });
    
    it('should repond with 500 error and error mesage if the payment cannot be processed as the user has already paid', function(done) {
      /* TODO */
      done();
    });
    
    it('should repond with 500 error and error mesage if the payment cannot be processed as the user is the host', function(done) {
      /* TODO */
      done();
    });
  });
});
