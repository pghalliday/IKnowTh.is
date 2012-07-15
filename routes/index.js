var Event = require('../models/event.js');
var fs = require('fs');

exports.index = function(req, res){
  Event.find(function(error, events) {
    res.render('index', { title: config.title, events: events });
  });
};

exports.event = function(req, res){
  Event.findOne({_id: req.params.id}, function(error, event) {
        res.render('event', { title: config.title, googleHangoutUrl: config.googleHangoutUrl, googleProjectId: config.googleProjectId, event: event });
    });
};

exports.eventImage = function(req, res){
  Event.findOne({_id: req.params.id}, function(error, event) {
    if (event.image && event.image.data) {
      res.contentType(event.image.contentType);
      res.send(event.image.data);
    } else {
      res.redirect('/img/default.jpg');
    }
  });
};

exports.editEvent = function(req, res){
  Event.findOne({_id: req.params.id}, function(error, event) {
        res.render('editEvent', { title: config.title, event: event });
    });
};

exports.newEvent = function(req, res){
  res.render('newEvent', { title: config.title });
};

exports.addEvent = function(req, res){
  var event
  if (req.files.image.size > 0) {
    event = new Event({
        host: req.user._id
      , name: req.body.name
      , image: { data: fs.readFileSync(req.files.image.path), contentType: req.files.image.type }
      , description: req.body.description
      , date: req.body.date
      , time: req.body.time
      });
  } else {
    event = new Event({
        host: req.user._id
      , name: req.body.name
      , description: req.body.description
      , date: req.body.date
      , time: req.body.time
    });
  }
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
      res.send('{"msg" : "Event Started"}');
    });
};

exports.hangout = function(req, res){
  Event.find(function(error, events) {
    res.render('hangout', { layout: false, title: config.title });
  });
};
