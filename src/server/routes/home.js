var Event = require('../models/event.js'),
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
