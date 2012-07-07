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

exports.addEvent = function(req, res){
  res.render('addEvent', { title: '5Live' });
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