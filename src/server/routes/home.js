var Event = require('../models/event.js'),
    User = require('../models/user.js'),
    Payment = require('../models/payment.js'),
    config = require(process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'] + '/.iknowth.is/config.js').properties;

exports.home = function(req, res) {
  var now = Date.now();
  Event.where('date').gte(now).sort('date').exec(function(error, upcomingEvents) {
    if (error) {
      // TODO: render a standard error?
      console.log(new Error('Failed to find upcoming events'));
      console.log(error);
      res.render('error', {
        user: req.user,
        title: config.title
      });
    } else {
      Event.where('date').lt(now).sort('-date').exec(function(error, pastEvents) {
        if (error) {
          // TODO: render a standard error?
          console.log(new Error('Failed to find upcoming events'));
          console.log(error);
          res.render('error', {
            user: req.user,
            title: config.title
          });
        } else {
          res.render('home', {
            user: req.user,
            title: config.title,
            upcomingEvents: upcomingEvents,
            pastEvents: pastEvents
          });
        }
      });
    }
  });
};

exports.resetDatabase = function(req, res) {
  console.log(req.user);
  if (req.user.isSuperUser()) {
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
            res.redirect('/');  
          } else {
            Payment.remove({}, function(error) {
              if (error) {
                // TODO: try again?
                console.log((new Error('Failed to remove the payments')));
                console.log(error);
              } else {
                console.log('Database has been reset!');
              }
              res.redirect('/');  
            });
          }
        });
      }      
    });
  } else {
    // TODO: send unauthorised users back to the home page?
    console.log((new Error('Someone not authorised tried to reset the users!')));
    res.redirect('/');
  }
};
