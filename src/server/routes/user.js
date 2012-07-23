var User = require('../models/user.js'),
    config = require(process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'] + '/.iknowth.is/config.js').properties;

exports.user = function(req, res) {
  if (!req.user) {
    // TODO: render a standard error?
    console.log(new Error('User is not logged in'));
    res.render('error', {
      title: config.title
    });
  } else {
    req.user.getAttendedEvents(function(error, attendedEvents) {
      if (error) {
        console.log(new Error('Could not retrieve attended events'));
        console.log(error);
      } else {
        req.user.getHostedEvents(function(error, hostedEvents) {
          if (error) {
            console.log(new Error('Could not retrieve hosted events'));
            console.log(error);
          } else {
            res.render('user', {
              title: config.title,
              attendedEvents: attendedEvents,
              hostedEvents: hostedEvents
            });
          }
        });
      }
    });
  }
};
