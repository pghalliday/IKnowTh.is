describe('Postback', function() {
  var Postback = require('./Postback'),
      Jwt = require('./Jwt'),
      should = require('should');

  var postbackUrlChecked, postbackBodyChecked, postbackEndCalled;

  describe('#post', function() {
    it('should post a correct JWT to the postback url', function(done) {
      var jwt = new Jwt('secret');
      var superagent = new Superagent(true, '456789123');
      var postback = new Postback('http://localhost/postback', 'MySeller', superagent, jwt);
      postbackUrlChecked = false;
      postbackBodyChecked = false;
      postbackEndCalled = false;
      postback.post('123456789', '789456123', 'My Request', '456789123', function(err, postbackJwt) {
        postbackUrlChecked.should.eql(true);
        postbackBodyChecked.should.eql(true);
        postbackEndCalled.should.eql(true);
        should.not.exist(err);
        jwt.encode({
          iss: 'Google',
          aud: 'MySeller',
          typ: 'google/payments/inapp/item/v1/postback/buy',
          iat: '123456789',
          exp: '789456123',
          request: 'My Request',
          response: {
            orderId: '456789123'
          }
        }, function(err, encoded) {
          postbackJwt.should.eql(encoded);
          done();
        });
      });
    });
    
    it('should return an error if the jwt cannot be encoded', function(done) {
      var jwt = new Jwt(null);
      var superagent = new Superagent(true, '456789123');
      var postback = new Postback('http://localhost/postback', 'MySeller', superagent, jwt);
      postback.post('123456789', '789456123', 'My Request', '456789123', function(err, postbackJwt) {
        should.exist(err);
        should.not.exist(postbackJwt);
        done();
      });
    });
    
    it('should return an error if the postback request does not return the orderId', function(done) {
      var jwt = new Jwt('secret');
      var superagent = new Superagent(true, 'some random text');
      var postback = new Postback('http://localhost/postback', 'MySeller', superagent, jwt);
      postback.post('123456789', '789456123', 'My Request', '456789123', function(err, postbackJwt) {
        should.exist(err);
        err.toString().should.eql((new Error('Postback failed')).toString());
        should.not.exist(postbackJwt);
        done();
      });
    });
    
    it('should return an error if the postback request does not return 200 OK', function(done) {
      var jwt = new Jwt('secret');
      var superagent = new Superagent(false, '456789123');
      var postback = new Postback('http://localhost/postback', 'MySeller', superagent, jwt);
      postback.post('123456789', '789456123', 'My Request', '456789123', function(err, postbackJwt) {
        should.exist(err);
        err.toString().should.eql((new Error('Postback failed')).toString());
        should.not.exist(postbackJwt);
        done();
      });
    });
  });

  var Superagent = function(ok, text) {
    this.post = function(url) {
      url.should.eql('http://localhost/postback');
      postbackUrlChecked = true;
      return {
        send: function(body) {
          var jwt = new Jwt('secret');
          jwt.encode({
            iss: 'Google',
            aud: 'MySeller',
            typ: 'google/payments/inapp/item/v1/postback/buy',
            iat: '123456789',
            exp: '789456123',
            request: 'My Request',
            response: {
              orderId: '456789123'
            }
          }, function(err, encoded) {
            body.should.eql({
              jwt: encoded
            });
            postbackBodyChecked = true;
          });
          return {
            end: function(callback) {
              postbackEndCalled = true;
              callback({
                ok: ok,
                text: text
              });
            }
          };
        },
      };
    };
  };
});
