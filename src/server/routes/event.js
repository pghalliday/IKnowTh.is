var Event = require('../models/event.js'),
    fs = require('fs'),
    config = require(process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'] + '/.iknowth.is/config.js').properties;

exports.event = function(req, res) {
  Event.findOne({
    _id: req.params.id
  }, function(error, event) {
    if (error) {
      // TODO: render a standard error?
      console.log(new Error('Failed to find event'));
      console.log(error);
      res.render('error', {
        user: req.user,
        profile: req.profile,
        title: config.title
      });
    } else {
      res.render('event', {
        user: req.user,
        title: config.title,
        maximumAttendees: config.maximumAttendees,
        googleHangoutUrl: config.googleHangoutUrl,
        googleHangoutProjectId: config.googleHangoutProjectId,
        paypalUrl: config.paypalUrl,
        event: event
      });
    }
  });
};

exports.eventImage = function(req, res) {
  Event.findOne({
    _id: req.params.id
  }, function(error, event) {
    if (error) {
      // TODO: return the default image for unknown events?
      console.log(new Error('Failed to find event'));
      console.log(error);
      res.redirect('/img/default.jpg');
    } else {
      if (event.image && event.image.data) {
        res.contentType(event.image.contentType);
        res.send(event.image.data);
      } else {
        res.redirect('/img/default.jpg');
      }
    }
  });
};

exports.newEvent = function(req, res) {
  res.render('newEvent', {
    user: req.user,
    title: config.title
  });
};

exports.addEvent = function(req, res) {
  var eventData = {
    name: req.body.name,
    description: req.body.description,
    date: req.body.unixTime,
  };
  if (req.files.image.size > 0) {
    eventData.image = {
      data: fs.readFileSync(req.files.image.path),
      contentType: req.files.image.type
    };
  }
  req.user.host(eventData, function(error, event) {
    if (error) {
      // TODO: this will result in an error page
      console.log((new Error('Failed to add event')));
      console.log(error);
      res.redirect('/event/' + 0);
    } else {
      res.redirect('/event/' + event._id);
    }
  });
};

exports.deleteEvent = function(req, res) {
  Event.findOne({
    _id: req.params.id
  }, function(error, event) {
    if (error) {
      // TODO: try again?
      console.log((new Error('Failed to find event')));
      console.log(error);
      res.redirect('/event/' + req.params.id);
    } else {
      event.remove();
      res.redirect('/');
    }
  });
};

exports.attendEvent = function(req, res) {
  Event.findOne({
    _id: req.params.id
  }, function(error, event) {
    if (error) {
      // TODO: try again?
      console.log((new Error('Failed to find event')));
      console.log(error);
      res.redirect('/event/' + req.params.id);
    } else {
      req.user.pendPayment(event, function(error, pendingPayment) {
        if (error) {
          // TODO: try again?
          console.log((new Error('Failed to pend the payment')));
          console.log(error);
          res.redirect('/event/' + req.params.id);
        } else {
          // request payment authorization
          res.redirect(config.paypalUrl + '/cgi-bin/webscr?cmd=_express-checkout&token=' + pendingPayment.paypalSetExpressCheckoutResponse.token);
        }
      });
    }
  });
};

exports.attendEventContinue = function(req, res) {
  Event.findOne({
    _id: req.params.id
  }, function(error, event) {
    if (error) {
      // TODO: try again?
      console.log((new Error('Failed to find event')));
      console.log(error);
      res.redirect('/event/' + req.params.id);
    } else {
      req.user.confirmPayment(event, req.query, function(error, attendee) {
        if (error) {
          console.log((new Error('Failed to confirm the payment')));
          console.log(error);
          // TODO: add error message to response!
          res.redirect('/event/' + req.params.id);
        } else {
          res.redirect('/event/' + req.params.id);
        }
      });
    }
  });
};

exports.attendEventCancel = function(req, res) {
  Event.findOne({
    _id: req.params.id
  }, function(error, event) {
    if (error) {
      // TODO: try again?
      console.log((new Error('Failed to find event')));
      console.log(error);
      res.redirect('/event/' + req.params.id);
    } else {
      req.user.cancelPayment(event, req.query, function(error) {
        res.redirect('/event/' + req.params.id);
      });
    }
  });
};

exports.startEvent = function(req, res) {
  Event.findOne({
    _id: req.params.id
  }, function(error, event) {
    if (error) {
      // TODO: send back error response?
      console.log((new Error('Failed to find event')));
      console.log(error);
      res.json({
        success: false,
        msg: "Error: Failed to find event"
      });
    } else {
      event.hangout = req.body.hangout;
      event.save(function(error) {
        if (error) {
          // TODO: send back error response?
          console.log((new Error('Failed to update hangout field in event')));
          console.log(error);
          res.json({
            success: false,
            msg: "Error: Failed to start event"
          });
        } else {
          res.json({
            success: true,
            msg: "Success: Event Started"
          });
        }
      });
    }
  });
};

exports.completeEvent = function(req, res) {
  Event.findOne({
    _id: req.params.id
  }, function(error, event) {
    if (error) {
      // TODO: try again?
      console.log((new Error('Failed to find event')));
      console.log(error);
      res.redirect('/event/' + req.params.id);
    } else {
      event.setComplete(function(error) {
        if (error) {
          // TODO: try again?
          console.log((new Error('Failed to mark event complete')));
          console.log(error);
          res.redirect('/event/' + req.params.id);
        } else {
          res.redirect('/event/' + req.params.id);          
        }
      });
    }
  });
};

exports.confirmReceipt = function(req, res) {
  Event.findOne({
    _id: req.params.id
  }, function(error, event) {
    if (error) {
      // TODO: try again?
      console.log((new Error('Failed to find event')));
      console.log(error);
      res.redirect('/event/' + req.params.id);
    } else {
      event.confirmReceipt(req.user, function(error) {
        if (error) {
          // TODO: try again?
          console.log((new Error('Failed to confirm receipt of event')));
          console.log(error);
          res.redirect('/event/' + req.params.id);
        } else {
          res.redirect('/event/' + req.params.id);          
        }
      });
    }
  });
};

exports.disputeReceipt = function(req, res) {
  Event.findOne({
    _id: req.params.id
  }, function(error, event) {
    if (error) {
      // TODO: try again?
      console.log((new Error('Failed to find event')));
      console.log(error);
      res.redirect('/event/' + req.params.id);
    } else {
      event.disputeReceipt(req.user, function(error) {
        if (error) {
          // TODO: try again?
          console.log((new Error('Failed to dispute receipt of event')));
          console.log(error);
          res.redirect('/event/' + req.params.id);
        } else {
          res.redirect('/event/' + req.params.id);          
        }
      });
    }
  });
};

exports.resetEvent = function(req, res) {
  if (req.user.isSuperUser()) {
    Event.findOne({
      _id: req.params.id
    }, function(error, event) {
      if (error) {
        // TODO: try again?
        console.log((new Error('Failed to find event')));
        console.log(error);
        res.redirect('/event/' + req.params.eventId);
      } else {
        event.resetAttendees(function(error) {
          if (error) {
            console.log((new Error('Failed to reset attendees')));
            console.log(error);
          } else {
            // TODO: whatever happens send the user back to the event page?
            res.redirect('/event/' + req.params.id);
          }
        });
      }
    });
  } else {
    // TODO: send unauthorised users back to the event page?
    console.log((new Error('Someone not authorised tried to reset an event!')));
    res.redirect('/event/' + req.params.id);
  }
};

exports.resetEvents = function(req, res) {
  if (req.user.isSuperUser()) {
    Event.remove({}, function(error) {
      if (error) {
        // TODO: try again?
        console.log((new Error('Failed to remove the events')));
        console.log(error);
      }
      res.redirect('/');
    });
  } else {
    // TODO: send unauthorised users back to the home page?
    console.log((new Error('Someone not authorised tried to reset the events!')));
    res.redirect('/');
  }
};
