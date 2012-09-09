module.exports = function(fs, baseUrl) {
  var xml = require('xml');
  this.get = function(req, res) {
    res.contentType('application/xml; charset=UTF-8');
    fs.readFile('src/server/hangout.xml', 'utf8', function(error, data) {
      if (error) {
        res.send(500, xml({
          error: {
            _attr: {
              descripion: 'Cannot load XML template',
              cause: error.toString()
            }
          }
        }));
      } else {
        res.send(200, data.replace('IFRAMEURL', baseUrl + '/hangout'));
      }
    });
  };
};
