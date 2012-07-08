var Event = require('../models/event.js');

exports.index = function(req, res){
  Event.find(function(error, events) {
    res.render('index', { title: '5Live', events: events });
  });
};

exports.event = function(req, res){
  Event.findOne({_id: req.params.id}, function(error, event) {
        res.render('event', { title: '5Live', event: event });
    });
};

exports.editEvent = function(req, res){
  Event.findOne({_id: req.params.id}, function(error, event) {
        res.render('editEvent', { title: '5Live', event: event });
    });
};

exports.newEvent = function(req, res){
  res.render('newEvent', { title: '5Live' });
};

exports.addEvent = function(req, res){
  var event = new Event({host: req.user._id, name: req.body.name, description: req.body.description, date: req.body.date, time: req.body.time});
  event.save();
  res.redirect('/event/' + event._id);
};

exports.deleteEvent = function(req, res){
  Event.findOne({_id: req.params.id}, function(error, event) {
      event.remove();
      res.redirect('/');
    });
};

exports.attendEvent = function(req, res){
  Event.findOne({_id: req.params.id}, function(error, event) {
      event.attendees.push(req.user._id);
      event.save();
      res.redirect('/event/' + req.params.id);
    });
};

exports.startEvent = function(req, res){
  Event.findOne({_id: req.params.id}, function(error, event) {
      event.hangout = req.body.hangout;
      event.save();
      res.redirect('/event/' + req.params.id);
    });
};