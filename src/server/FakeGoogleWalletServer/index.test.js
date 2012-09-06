describe('FakeGoogleWalletServer', function() {
  var FakeGoogleWalletServer = require('./'),
      should = require('should'),
      jwtSimple = require('jwt-simple'),
      supertest = require('supertest');
  
  var fakeGoogleWalletServer = new FakeGoogleWalletServer('MySeller', 'secret', '/postback', 10000);
  
  var now = Date.now();
  var anHourFromNow = now + (1000 * 60 * 60);
  var request = {
    name: 'Piece of Cake',
    description: 'Virtual chocolate cake to fill your virtual tummy',
    price: '10.50',
    currencyCode: 'USD',
    sellerData: 'user_id:1224245,offer_code:3098576987,affiliate:aksdfbovu9j'
  };
  var requestBody = {
    jwt: jwtSimple.encode({
      iss: 'MySeller',
      aud: 'Google',
      typ: 'google/payments/inapp/item/v1',
      iat: now.toString(),
      exp: anHourFromNow.toString(),
      request: request
    }, 'secret')
  };
  var responseBody = {
    request: requestBody.jwt.request,
    response: {
      orderId: "10000"
    },
    jwt: jwtSimple.encode({
      iss: 'Google',
      aud: 'MySeller',
      typ: 'google/payments/inapp/item/v1/postback/buy',
      iat: now.toString(),
      exp: anHourFromNow.toString(),
      request: request,
      response: {
        orderId: "10000"
      }
    }, 'secret')
  };
  var cancelResponseBody = {
    request: request,
    response: {
      errorType: "PURCHASE_CANCELLED"
    }
  };

  describe('POST /purchase', function() {
    it('should respond on /purchase', function(done) {
      supertest(fakeGoogleWalletServer.app).post('/purchase').send(requestBody).expect(200, responseBody, done);
    });
  });
  
  describe('POST /cancel', function() {
    it('should respond on /cancel', function(done) {
      supertest(fakeGoogleWalletServer.app).post('/cancel').send(requestBody).expect(500, cancelResponseBody, done);
    });
  });
});
