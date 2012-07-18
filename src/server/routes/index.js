var Event = require('../models/event.js'),
    fs = require('fs'),
    payflowpro = require('paynode').use('payflowpro'),
    config = require('../config.js').properties;

var paypalClient = payflowpro.createClient({
  level: config.paypalLevel,
  user: config.paypalUser,
  password: config.paypalPassword,
  signature: config.paypalSignature
});

exports.index = function(req, res) {
  Event.find(function(error, events) {
    res.render('index', {
      title: config.title,
      events: events
    });
  });
};

exports.event = function(req, res) {
  Event.findOne({
    _id: req.params.id
  }, function(error, event) {
    res.render('event', {
      title: config.title,
      maximumAttendees: config.maximumAttendees,
      googleHangoutUrl: config.googleHangoutUrl,
      googleProjectId: config.googleProjectId,
      paypalUrl: config.paypalUrl,
      event: event
    });
  });
};

exports.eventImage = function(req, res) {
  Event.findOne({
    _id: req.params.id
  }, function(error, event) {
    if (event.image && event.image.data) {
      res.contentType(event.image.contentType);
      res.send(event.image.data);
    } else {
      res.redirect('/img/default.jpg');
    }
  });
};

exports.newEvent = function(req, res) {
  res.render('newEvent', {
    title: config.title
  });
};

exports.addEvent = function(req, res) {
  var event;
  if (req.files.image.size > 0) {
    event = new Event({
      host: req.user._id,
      name: req.body.name,
      image: {
        data: fs.readFileSync(req.files.image.path),
        contentType: req.files.image.type
      },
      description: req.body.description,
      date: req.body.date,
      time: req.body.time
    });
  } else {
    event = new Event({
      host: req.user._id,
      name: req.body.name,
      description: req.body.description,
      date: req.body.date,
      time: req.body.time
    });
  }
  event.save();
  res.redirect('/event/' + event._id);
};

exports.deleteEvent = function(req, res) {
  Event.findOne({
    _id: req.params.id
  }, function(error, event) {
    event.remove();
    res.redirect('/');
  });
};

exports.attendEvent = function(req, res) {
  Event.findOne({
    _id: req.params.eventId
  }, function(error, event) {
    if (event.attendees.length < config.maximumAttendees) {
      // reserve a spot for the attendee so no one else can reserve it
      event.attendees.push({
        userId: req.params.userId,
        paypalToken: '',
        confirmed: false
      });
      event.save();
      var attendee = event.getAttendee(req.params.userId);
      // start the paypal transaction
      paypalClient.setExpressCheckout({
        returnurl: config.baseUrl + '/attendEventContinue/' + req.params.eventId + '/' + req.params.userId,
        cancelurl: config.baseUrl + '/attendEventCancel/' + req.params.eventId + '/' + req.params.userId,
        paymentrequest: [{
          amt: '5.00',
          currencyCode: 'EUR',
          paymentAction: 'Sale'
        }]
      }).on('success', function(response) {
        // associate the payment token with the reserved spot
        attendee.paypalToken = response.token;
        event.save();
        // request payment authorization
        res.redirect(config.paypalUrl + '/cgi-bin/webscr?cmd=_express-checkout&token=' + response.token);
      }).on('failure', function(response) {
        console.log(response.errors);
        // free the reserved spot
        attendee.remove();
        event.save();
        // send the user back to the event page
        res.redirect('/event/' + req.params.eventId);
      });
    } else {
      res.redirect('/event/' + req.params.eventId);
    }
  });
};

exports.attendEventContinue = function(req, res) {
  Event.findOne({
    _id: req.params.eventId
  }, function(error, event) {
    var attendee = event.getAttendee(req.params.userId);
    if (attendee !== null) {
      if (attendee.paypalToken === req.query.token) {
        paypalClient.doExpressCheckoutPayment({
          token: req.query.token,
          payerid: req.query.PayerID,
          paymentrequest: [{
            amt: '5.00',
            currencyCode: 'EUR',
            paymentAction: 'Sale'
          }]
        }).on('success', function(response) {
          // mark the attendee as confirmed
          attendee.confirmed = true;
          event.save();
          // send the user back to the event page
          res.redirect('/event/' + req.params.eventId);
        }).on('failure', function(response) {
          console.log(response.errors);
          // free the reserved spot
          attendee.remove();
          event.save();
          // send the user back to the event page
          res.redirect('/event/' + req.params.eventId);
        });
      } else {
        res.redirect('/event/' + req.params.eventId);
      }
    } else {
      res.redirect('/event/' + req.params.eventId);
    }
  });
};

exports.attendEventCancel = function(req, res) {
  Event.findOne({
    _id: req.params.eventId
  }, function(error, event) {
    var attendee = event.getAttendee(req.params.userId);
    if (attendee !== null) {
      if (attendee.paypalToken === req.query.token) {
        // free the reserved spot				
        attendee.remove();
        event.save();
        // send the user back to the event page
        res.redirect('/event/' + req.params.eventId);
      } else {
        res.redirect('/event/' + req.params.eventId);
      }
    } else {
      res.redirect('/event/' + req.params.eventId);
    }
  });
};

exports.startEvent = function(req, res) {
  Event.findOne({
    _id: req.params.id
  }, function(error, event) {
    event.hangout = req.body.hangout;
    event.save();
    res.json({
      msg: "Event Started"
    });
  });
};

exports.hangout = function(req, res) {
  Event.find(function(error, events) {
    res.render('hangout', {
      layout: false,
      title: config.title
    });
  });
};

exports.hangoutxml = function(req, res) {
  res.contentType('application/xml; charset=UTF-8');
  res.send(fs.readFileSync('hangout.xml', 'utf8').replace('IFRAMEURL', config.baseUrl + '/hangout'));
};

exports.resetEvent = function(req, res) {
  if (config.isSuperUser(req.user.id)) {
    Event.findOne({
      _id: req.params.id
    }, function(error, event) {
      event.resetAttendees();
      event.save();
      res.redirect('/event/' + req.params.id);
    });
  } else {
    res.redirect('/event/' + req.params.id);
  }
};
