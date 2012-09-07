describe('Request', function() {
  var Request = require('./Request'),
      jwtSimple = require('jwt-simple'),
      Jwt = require('./Jwt'),
      should = require('should');

  var jwt = new Jwt('secret');
  var request = new Request(jwt, 'MySeller');

  describe('#parse', function() {
    it('should parse a valid request', function(done) {
      request.parse({
        jwt: jwtSimple.encode({
          iss: 'MySeller',
          aud: 'Google',
          typ: 'google/payments/inapp/item/v1',
          iat: '123456789',
          exp: '987654321',
          request: 'request data'
        }, 'secret')
      }, function(err, request, iat, exp) {
        should.not.exist(err);
        request.should.eql('request data');
        iat.should.eql('123456789');
        exp.should.eql('987654321');
        done();
      });
    });
    
    it('should fail if no body is supplied', function(done) {
      request.parse(null, function(err, request, iat, exp) {
        should.exist(err);
        err.toString().should.eql((new Error('No body supplied')).toString());
        should.not.exist(request);
        should.not.exist(iat);
        should.not.exist(exp);
        done();
      });
    });
    
    it('should fail if body has no jwt field', function(done) {
      request.parse('body', function(err, request, iat, exp) {
        should.exist(err);
        err.toString().should.eql((new Error('Body has no jwt field')).toString());
        should.not.exist(request);
        should.not.exist(iat);
        should.not.exist(exp);
        done();
      });
    });
    
    it('should fail if jwt field cannot be decoded', function(done) {
      request.parse({jwt: 'some data'}, function(err, request, iat, exp) {
        should.exist(err);
        err.toString().should.eql((new Error('Jwt field cannot be decoded')).toString());
        should.not.exist(request);
        should.not.exist(iat);
        should.not.exist(exp);
        done();
      });
    });
    
    it('should fail if decoded JWT does not contain a request field', function(done) {
      request.parse({
        jwt: jwtSimple.encode({
          iss: 'MySeller',
          aud: 'Google',
          typ: 'google/payments/inapp/item/v1',
          iat: '123456789',
          exp: '987654321'
        }, 'secret')
      }, function(err, request, iat, exp) {
        should.exist(err);
        err.toString().should.eql((new Error('Decoded JWT does not contain a request field')).toString());
        should.not.exist(request);
        iat.should.eql('123456789');
        exp.should.eql('987654321');
        done();
      });
    });
    
    it('should fail if decoded JWT does not contain an iat field', function(done) {
      request.parse({
        jwt: jwtSimple.encode({
          iss: 'MySeller',
          aud: 'Google',
          typ: 'google/payments/inapp/item/v1',
          exp: '987654321',
          request: 'request data'
        }, 'secret')
      }, function(err, request, iat, exp) {
        should.exist(err);
        err.toString().should.eql((new Error('Decoded JWT does not contain an iat field')).toString());
        should.exist(request);
        request.should.eql('request data');
        should.not.exist(iat);
        exp.should.eql('987654321');
        done();
      });
    });
    
    it('should fail if decoded JWT does not contain an exp field', function(done) {
      request.parse({
        jwt: jwtSimple.encode({
          iss: 'MySeller',
          aud: 'Google',
          typ: 'google/payments/inapp/item/v1',
          iat: '123456789',
          request: 'request data'
        }, 'secret')
      }, function(err, request, iat, exp) {
        should.exist(err);
        err.toString().should.eql((new Error('Decoded JWT does not contain an exp field')).toString());
        request.should.eql('request data');
        iat.should.eql('123456789');
        should.not.exist(exp);
        done();
      });
    });
    
    it('should fail if decoded JWT does not have typ field equal to "google/payments/inapp/item/v1"', function(done) {
      request.parse({
        jwt: jwtSimple.encode({
          iss: 'MySeller',
          aud: 'Google',
          typ: 'hello',
          iat: '123456789',
          exp: '987654321',
          request: 'request data'
        }, 'secret')
      }, function(err, request, iat, exp) {
        should.exist(err);
        err.toString().should.eql((new Error('Decoded JWT does not have typ field equal to "google/payments/inapp/item/v1"')).toString());
        request.should.eql('request data');
        iat.should.eql('123456789');
        exp.should.eql('987654321');
        done();
      });
    });
    
    it('should fail if decoded JWT does not have aud field equal to "Google"', function(done) {
      request.parse({
        jwt: jwtSimple.encode({
          iss: 'MySeller',
          aud: 'SomeCompany',
          typ: 'google/payments/inapp/item/v1',
          iat: '123456789',
          exp: '987654321',
          request: 'request data'
        }, 'secret')
      }, function(err, request, iat, exp) {
        should.exist(err);
        err.toString().should.eql((new Error('Decoded JWT does not have aud field equal to "Google"')).toString());
        request.should.eql('request data');
        iat.should.eql('123456789');
        exp.should.eql('987654321');
        done();
      });
    });
    
    it('should fail if decoded JWT does not have iss field equal to sellerId', function(done) {
      request.parse({
        jwt: jwtSimple.encode({
          iss: 'WrongSeller',
          aud: 'Google',
          typ: 'google/payments/inapp/item/v1',
          iat: '123456789',
          exp: '987654321',
          request: 'request data'
        }, 'secret')
      }, function(err, request, iat, exp) {
        should.exist(err);
        err.toString().should.eql((new Error('Decoded JWT does not have iss field equal to sellerId')).toString());
        request.should.eql('request data');
        iat.should.eql('123456789');
        exp.should.eql('987654321');
        done();
      });
    });
  });
});
