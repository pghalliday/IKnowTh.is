describe('Jwt', function() {
  var Jwt = require('./Jwt'),
      jwtSimple = require('jwt-simple'),
      should = require('should');
      
  describe('#encode', function() {
    it('should fail if encoder throws an error', function(done) {
      var jwt = new Jwt(null);
      jwt.encode({
        data: 'some data'
      }, function(err, encoded) {
        should.exist(err);
        should.not.exist(encoded);
        done();
      });
    });
    
    it('should encode usng encoder', function(done) {
      var jwt = new Jwt('secret');
      jwt.encode({
        data: 'some data'
      }, function(err, encoded) {
        should.not.exist(err);
        should.exist(encoded);
        encoded.should.eql(jwtSimple.encode({
          data: 'some data'
        }, 'secret'));
        done();
      });
    });
    
    it('should not catch errors thrown from callback', function(done) {
      var jwt = new Jwt('secret');
      var error;
      try {
        jwt.encode({
          data: 'some data'
        }, function(err, encoded) {
          throw new Error('this is a test');
        });
      } catch(err) {
        error = err;
      }
      should.exist(error);
      error.toString().should.eql((new Error('this is a test')).toString());
      done();
    });
  });
  
  describe('#decode', function() {
    it('should fail if encoder throws an error', function(done) {
      var jwt = new Jwt('wrong secret');
      jwt.decode(jwtSimple.encode({
        data: 'some data'
      }, 'secret'), function(err, decoded) {
        should.exist(err);
        should.not.exist(decoded);
        done();
      });
    });
    
    it('should decode using encoder', function(done) {
      var jwt = new Jwt('secret');
      jwt.decode(jwtSimple.encode({
        data: 'some data'
      }, 'secret'), function(err, decoded) {
        should.not.exist(err);
        should.exist(decoded);
        decoded.should.eql({
          data: 'some data'
        });
        done();
      });
    });
    
    it('should not catch errors thrown from callback', function(done) {
      var jwt = new Jwt('secret');
      var error;
      try {
        jwt.decode(jwtSimple.encode({
          data: 'some data'
        }, 'secret'), function(err, decoded) {
          throw new Error('this is a test');
        });
      } catch(err) {
        error = err;
      }
      should.exist(error);
      error.toString().should.eql((new Error('this is a test')).toString());
      done();
    });
  });
});