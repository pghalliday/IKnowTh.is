var Event = require('../models/event.js'),
    User = require('../models/user.js'),
    config = require('../config.js').properties;

exports.home = function(req, res) {
  Event.find(function(error, events) {
    if (error) {
      // TODO: render a standard error?
      console.log(new Error('Failed to find events'));
      console.log(error);
      res.render('error', {
        title: config.title
      });
    } else {
      res.render('home', {
        title: config.title,
        events: events
      });
    }
  });
};

exports.resetDatabase = function(req, res) {
  if (config.isSuperUser(req.user)) {
    Event.remove({}, function(error) {
      if (error) {
        // TODO: try again?
        console.log((new Error('Failed to remove the events')));
        console.log(error);
        res.redirect('/');  
      } else {
        User.remove({}, function(error) {
          if (error) {
            // TODO: try again?
            console.log((new Error('Failed to remove the users')));
            console.log(error);
          } else {
            console.log('Database has been reset!');
          }
          res.redirect('/');  
        });
      }      
    });
  } else {
    // TODO: send unauthorised users back to the home page?
    console.log((new Error('Someone not authorised tried to reset the users!')));
    res.redirect('/');
  }
};
