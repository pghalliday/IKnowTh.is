describe('Jwt', function() {
  var Jwt = require('./Jwt'),
      should = require('should');
      
  describe('#encode', function() {
    it('should fail if encoder throws an error', function(done) {
      var jwt = new Jwt(null, encoder);
      jwt.encode({
        data: 'some data'
      }, function(err, encoded) {
        should.exist(err);
        should.not.exist(encoded);
        done();
      });
    });
    
    it('should encode usng encoder', function(done) {
      var jwt = new Jwt('secret', encoder);
      jwt.encode({
        data: 'some data'
      }, function(err, encoded) {
        should.not.exist(err);
        should.exist(encoded);
        encoded.should.eql({
          key: 'secret',
          decoded: {
            data: 'some data'
          }
        });
        done();
      });
    });
    
    it('should not catch errors thrown from callback', function(done) {
      var jwt = new Jwt('secret', encoder);
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
      var jwt = new Jwt('wrong secret', encoder);
      jwt.decode({
        key: 'secret',
        decoded: {
          data: 'some data'
        }
      }, function(err, decoded) {
        should.exist(err);
        should.not.exist(decoded);
        done();
      });
    });
    
    it('should decode using encoder', function(done) {
      var jwt = new Jwt('secret', encoder);
      jwt.decode({
        key: 'secret',
        decoded: {
          data: 'some data'
        }
      }, function(err, decoded) {
        should.not.exist(err);
        should.exist(decoded);
        decoded.should.eql({
          data: 'some data'
        });
        done();
      });
    });
    
    it('should not catch errors thrown from callback', function(done) {
      var jwt = new Jwt('secret', encoder);
      var error;
      try {
        jwt.decode({
          key: 'secret',
          decoded: {
            data: 'some data'
          }
        }, function(err, decoded) {
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
  
  var encoder = {
    encode: function(payload, key) {
      if (key) {
        return {
          key: key,
          decoded: payload
        };
      } else {
        throw new Error('Require key');
      }
    },
    decode: function(token, key) {
      if (token.key === key) {
        if (token.decoded) {
          return token.decoded;
        } else {
          throw new Error('Invalid token');
        }
      } else {
        throw new Error('Invalid key');        
      }
    }
  };
});