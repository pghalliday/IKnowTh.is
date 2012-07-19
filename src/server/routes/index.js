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
    if (error) {
      // TODO: render a standard error?
      console.log(new Error('Failed to find events'));
      console.log(error);
      res.render('error', {
        title: config.title
      });
    } else {
      res.render('index', {
        title: config.title,
        events: events
      });
    }
  });
};

exports.event = function(req, res) {
  Event.findOne({
    _id: req.params.id
  }, function(error, event) {
    if (error) {
      // TODO: render a standard error?
      console.log(new Error('Failed to find event'));
      console.log(error);
      res.render('error', {
        title: config.title
      });
    } else {
      res.render('event', {
        title: config.title,
        maximumAttendees: config.maximumAttendees,
        googleHangoutUrl: config.googleHangoutUrl,
        googleProjectId: config.googleProjectId,
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
    title: config.title
  });
};

exports.addEvent = function(req, res) {
  var eventData = {
    name: req.body.name,
    description: req.body.description,
    date: req.body.date,
    time: req.body.time
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
    _id: req.params.eventId
  }, function(error, event) {
    if (error) {
      // TODO: try again?
      console.log((new Error('Failed to find event')));
      console.log(error);
      res.redirect('/event/' + req.params.eventId);
    } else {
      req.user.attend(event, function(error, attendee) {
        if (error) {
          // TODO: try again?
          console.log((new Error('Failed to add attendee to event')));
          console.log(error);
          res.redirect('/event/' + req.params.eventId);
        } else {
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
            event.save(function(error) {
              if (error) {
                // TODO: try again?
                console.log((new Error('Failed to save paypal token on attendee')));
                console.log(error);
                // free the reserved spot
                attendee.remove();
                event.save(function(error) {
                  if (error) {
                    console.log((new Error('Failed to remove attendee from event after failing to save paypal token')));
                    console.log(error);
                  }
                  // TODO: whatever happens send the user back to the event page?
                  res.redirect('/event/' + req.params.eventId);
                });
              } else {
                // request payment authorization
                res.redirect(config.paypalUrl + '/cgi-bin/webscr?cmd=_express-checkout&token=' + response.token);
              }
            });
          }).on('failure', function(response) {
            console.log((new Error('Failed to set express checkout information')));
            console.log(response.errors);
            // free the reserved spot
            attendee.remove();
            event.save(function(error) {
              if (error) {
                console.log((new Error('Failed to remove attendee from event after set express checkout information failure')));
                console.log(error);
              }
              // TODO: whatever happens send the user back to the event page?
              res.redirect('/event/' + req.params.eventId);
            });
          });
        }      
      });
    }
  });
};

exports.attendEventContinue = function(req, res) {
  Event.findOne({
    _id: req.params.eventId
  }, function(error, event) {
    if (error) {
      // TODO: try again?
      console.log((new Error('Failed to find event')));
      console.log(error);
      res.redirect('/event/' + req.params.eventId);
    } else {
      var attendee = event.getAttendee(req.user);
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
            event.save(function(error) {
              if (error) {
                // TODO: try again?
                console.log((new Error('Failed to mark attendee as confimred!!! This could be a problem as they have paid now!!!!')));
                console.log(error);
              }
              // TODO: send the user back to the event page whatever?
              res.redirect('/event/' + req.params.eventId);
            });
          }).on('failure', function(response) {
            console.log((new Error('Failed to set doExpressCheckoutPayment')));
            console.log(response.errors);
            // free the reserved spot
            attendee.remove();
            event.save(function(error) {
              if (error) {
                console.log((new Error('Failed to remove attendee from event after final payment failure')));
                console.log(error);
              }
              // TODO: whatever happens send the user back to the event page?
              res.redirect('/event/' + req.params.eventId);
            });
          });
        } else {
          // TODO: try again?
          console.log((new Error('Paypal token did not match assuming failure and removing attendee')));
          attendee.remove();
          event.save(function(error) {
            if (error) {
              console.log((new Error('Failed to remove attendee from event after paypal token mismatch')));
              console.log(error);
            }
            // TODO: whatever happens send the user back to the event page?
            res.redirect('/event/' + req.params.eventId);
          });
        }
      } else {
        // TODO: try again?
        console.log((new Error('Failed to find attendee')));
        res.redirect('/event/' + req.params.eventId);
      }
    }
  });
};

exports.attendEventCancel = function(req, res) {
  Event.findOne({
    _id: req.params.eventId
  }, function(error, event) {
    if (error) {
      // TODO: try again?
      console.log((new Error('Failed to find event')));
      console.log(error);
      res.redirect('/event/' + req.params.eventId);
    } else {
      var attendee = event.getAttendee(req.user);
      if (attendee !== null) {
        // free the reserved spot				
        attendee.remove();
        event.save(function(error) {
          if (error) {
            console.log((new Error('Failed to remove attendee from event after payment cancellation')));
            console.log(error);
          }
          // TODO: whatever happens send the user back to the event page?
          res.redirect('/event/' + req.params.eventId);
        });
      } else {
        // TODO: try again?
        console.log((new Error('Failed to find attendee')));
        res.redirect('/event/' + req.params.eventId);
      }
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

exports.hangout = function(req, res) {
  res.render('hangout', {
    layout: false,
    title: config.title
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
