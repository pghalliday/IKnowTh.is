var fs = require('fs'),
    config = require(process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'] + '/.iknowth.is/config.js').properties;

exports.hangout = function(req, res) {
  res.render('hangout', {
    layout: false,
    title: config.title
  });
};

exports.hangoutxml = function(req, res) {
  fs.readFile('src/server/hangout.xml', 'utf8', function(error, data) {
    if (error) {
      // TODO: render a standard error?
      console.log(new Error('Failed to read hangout.xml'));
      console.log(error);
      res.render('error', {
        title: config.title
      });      
    } else {
      res.contentType('application/xml; charset=UTF-8');
      res.send(data.replace('IFRAMEURL', config.baseUrl + '/hangout'));
    }
  });
};
