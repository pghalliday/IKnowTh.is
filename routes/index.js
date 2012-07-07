var Event = require('../models/event.js');

exports.index = function(req, res){
  Event.find(function(error, events) {
    res.render('index', { title: 'Expert Q&A', events: events });
  });
};

exports.event = function(req, res){
  Event.findOne({_id: req.params.id}, function(error, event) {
        res.render('event', { title: 'Expert Q&A', event: event });
    });
};

exports.editEvent = function(req, res){
  Event.findOne({_id: req.params.id}, function(error, event) {
        res.render('editEvent', { title: 'Expert Q&A', event: event });
    });
};

exports.addEvent = function(req, res){
  res.render('addEvent', { title: 'Expert Q&A' });
};

exports.addEventPost = function(req, res){
  var event = new Event({name: req.body.name, date: req.body.date, time: req.body.time});
  event.save();
  res.redirect('/editEvent/' + event._id);
};

exports.deleteEvent = function(req, res){
  Event.findOne({_id: req.params.id}, function(error, event) {
      event.remove();
      res.redirect('/');
    });
};