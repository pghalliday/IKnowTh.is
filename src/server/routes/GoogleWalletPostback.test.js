describe('GoogleWalletPostback', function() {
  var GoogleWalletPostback = require('./GoogleWalletPostback.js');
  var jwtSimple = require('jwt-simple');
  var secret = 'secret';

  // define a mock request object
  var mockRequest = {
    body: {
      jwt:  jwtSimple.encode({ 
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
      }, secret)
    }
  };
     
  // define a mock user table
  var MockUser = function(_id) {
    _id.should.eql(123);
    this._id = _id;
  };

  // define a mock event table
  var MockEvent = function(_id) {
    _id.should.eql(789);
    this._id = _id;
  };

  // define a mock payment table
  var MockPayment = function() {
  };

  // construct the instance to test
  var googleWalletPostback = new GoogleWalletPostback(secret, MockUser, MockEvent, MockPayment);      
      
  describe('#post()', function() {
    it('should respond with 200 OK and the order ID if the payment can be processed', function(done) {

      // flags and stuff so we can verify that the payment was actually processed
      var paymentProcessed = false,
          foundUser,
          foundEvent;
      
      // override the MockUser findById method
      MockUser.findById = function(_id, callback) {
        foundUser = new MockUser(_id);
        callback(null, foundUser);
      };

      // override the MockEvent findById method
      MockEvent.findById = function(_id, callback) {
         foundEvent = new MockEvent(_id);
         callback(null, foundEvent);
      };
    
      // override the MockPayment process method
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
      
      googleWalletPostback.post(mockRequest, mockResponse);
    });
    
    it('should respond with 500 error and error mesage if the payment cannot be processed as the user is unknown', function(done) {

      // flags and stuff so we can verify that the payment was actually processed
      var paymentProcessed = false;
      
      // override the MockUser findById method
      MockUser.findById = function(_id, callback) {
        callback(null, null);
      };

      // override the MockEvent findById method
      MockEvent.findById = function(_id, callback) {
         callback(null, new MockEvent(_id));
      };
    
      // override the MockPayment process method
      MockPayment.process = function(event, attendee, details, callback) {
        paymentProcessed = true;
        callback(null, null);
      };
      
      // define a mock response object
      var mockResponse = {
        send: function(status, body) {
          paymentProcessed.should.eql(false, 'payment should not have been processed');
          status.should.eql(500, 'response status should be 500');
          body.should.eql('User does not exist', 'should have the correct error message');
          done();
        }
      };
      
      googleWalletPostback.post(mockRequest, mockResponse);
    });
    
    it('should respond with 500 error and error mesage if the payment cannot be processed as an error is encountered while looking up the user', function(done) {

      // flags and stuff so we can verify that the payment was actually processed
      var paymentProcessed = false;
      
      // override the MockUser findById method
      MockUser.findById = function(_id, callback) {
        callback(new Error('Error retrieving user'), null);
      };

      // override the MockEvent findById method
      MockEvent.findById = function(_id, callback) {
         callback(null, new MockEvent(_id));
      };
    
      // override the MockPayment process method
      MockPayment.process = function(event, attendee, details, callback) {
        paymentProcessed = true;
        callback(null, null);
      };
      
      // define a mock response object
      var mockResponse = {
        send: function(status, body) {
          paymentProcessed.should.eql(false, 'payment should not have been processed');
          status.should.eql(500, 'response status should be 500');
          body.should.eql((new Error('Error retrieving user')).toString(), 'should have the correct error message');
          done();
        }
      };
      
      googleWalletPostback.post(mockRequest, mockResponse);
    });
        
    it('should respond with 500 error and error mesage if the payment cannot be processed as the event is unknown', function(done) {

      // flags and stuff so we can verify that the payment was actually processed
      var paymentProcessed = false;
      
      // override the MockUser findById method
      MockUser.findById = function(_id, callback) {
        callback(null, new MockUser(_id));
      };

      // override the MockEvent findById method
      MockEvent.findById = function(_id, callback) {
         callback(null, null);
      };
    
      // override the MockPayment process method
      MockPayment.process = function(event, attendee, details, callback) {
        paymentProcessed = true;
        callback(null, null);
      };
      
      // define a mock response object
      var mockResponse = {
        send: function(status, body) {
          paymentProcessed.should.eql(false, 'payment should not have been processed');
          status.should.eql(500, 'response status should be 500');
          body.should.eql('Event does not exist', 'should have the correct error message');
          done();
        }
      };
      
      googleWalletPostback.post(mockRequest, mockResponse);
    });
        
    it('should respond with 500 error and error mesage if the payment cannot be processed as an error is encountered while looking up the event', function(done) {

      // flags and stuff so we can verify that the payment was actually processed
      var paymentProcessed = false;
      
      // override the MockUser findById method
      MockUser.findById = function(_id, callback) {
        callback(null, new MockUser(_id));
      };

      // override the MockEvent findById method
      MockEvent.findById = function(_id, callback) {
         callback(new Error('Error retrieving event'), null);
      };
    
      // override the MockPayment process method
      MockPayment.process = function(event, attendee, details, callback) {
        paymentProcessed = true;
        callback(null, null);
      };
      
      // define a mock response object
      var mockResponse = {
        send: function(status, body) {
          paymentProcessed.should.eql(false, 'payment should not have been processed');
          status.should.eql(500, 'response status should be 500');
          body.should.eql((new Error('Error retrieving event')).toString(), 'should have the correct error message');
          done();
        }
      };
      
      googleWalletPostback.post(mockRequest, mockResponse);
    });
    
    it('should respond with 500 error and error mesage if the payment cannot be processed as an error is encountered while processing the payment', function(done) {

      // flags and stuff so we can verify that the payment was actually processed
      var paymentProcessed = false;
      
      // override the MockUser findById method
      MockUser.findById = function(_id, callback) {
        callback(null, new MockUser(_id));
      };

      // override the MockEvent findById method
      MockEvent.findById = function(_id, callback) {
         callback(null, new MockEvent(_id));
      };
    
      // override the MockPayment process method
      MockPayment.process = function(event, attendee, details, callback) {
        paymentProcessed = true;
        callback(new Error('Error processing payment'), null);
      };
      
      // define a mock response object
      var mockResponse = {
        send: function(status, body) {
          paymentProcessed.should.eql(true, 'payment should have been processed');
          status.should.eql(500, 'response status should be 500');
          body.should.eql((new Error('Error processing payment')).toString(), 'should have the correct error message');
          done();
        }
      };
      
      googleWalletPostback.post(mockRequest, mockResponse);
    });
  });
});
