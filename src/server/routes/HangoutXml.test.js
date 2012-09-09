describe('HangoutXml', function() {
  var HangoutXml = require('./HangoutXml');
  var xml = require('xml');
  
  describe('#get()', function() {
    it('should respond with 200 OK and correct data, etc', function(done) {
      var fs = new Fs(false);
      var hangoutXml = new HangoutXml(fs, 'baseUrl');
      var response = new Response(function(status, type, data) {
        fs.path.should.eql('src/server/hangout.xml');
        fs.encoding.should.eql('utf8');
        status.should.eql(200);
        type.should.eql('application/xml; charset=UTF-8');
        data.should.eql('IFrame URL is baseUrl/hangout');
        done();        
      });
      
      hangoutXml.get(request, response);
    });
    
    it('should respond with 500 error if xml template cannot be loaded', function(done) {
      var fs = new Fs(true);
      var hangoutXml = new HangoutXml(fs, 'baseUrl');
      var response = new Response(function(status, type, data) {
        fs.path.should.eql('src/server/hangout.xml');
        fs.encoding.should.eql('utf8');
        status.should.eql(500);
        type.should.eql('application/xml; charset=UTF-8');
        data.should.eql(xml({
          error: {
            _attr: {
              descripion: 'Cannot load XML template',
              cause: (new Error('This is a test')).toString()
            }
          }
        }));
        done();        
      });
      
      hangoutXml.get(request, response);
    });
  });
  
  var request = {};
  
  var Response = function(callback) {
    var self = this;
    self.contentType = function(type) {
      self.type = type;
    };
    self.send = function(status, data) {
      callback(status, self.type, data);
    };
  };
  
  var Fs = function(fail) {
    var self = this;
    this.readFile = function(path, encoding, callback) {
      self.path = path;
      self.encoding = encoding;
      if (fail) {
        callback(new Error('This is a test'));
      } else {
        callback(null, 'IFrame URL is IFRAMEURL');
      }
    };
  };
});
