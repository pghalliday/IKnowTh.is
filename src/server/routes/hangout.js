var fs = require('fs'),
    config = require(process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'] + '/.iknowth.is/config.js').properties;

exports.hangout = function(req, res) {
  res.render('hangout', {
    layout: false,
    title: config.title
  });
};

exports.hangoutxml = function(req, res) {
  res.contentType('application/xml; charset=UTF-8');
  res.send(fs.readFileSync('src/server/hangout.xml', 'utf8').replace('IFRAMEURL', config.baseUrl + '/hangout'));
};
