var mongoose = require('mongoose'),
    config = require('../config.js').properties,
    Schema = mongoose.Schema;

var AttendeeSchema = new Schema({
  dateAdded: {
    type: Date,
  default:
    Date.now
  },
  userId: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

/*
I will use pending payments to track whether
people leave the site during payment authorisation.
Because this is a strong possibility I don't want to
reserve their place in an event until we have some kind
of payment confirmation (Not sure about this though, we
could still reserve the spot). There needs to be a
background task that cleans out this records when they
get old as they will likely get orphaned (the advantage
of not reserving the spot is that this clean up can be quite
lazy)
*/
var PendingPaymentsSchema = new Schema({
  dateAdded: {
    type: Date,
  default:
    Date.now
  },
  userId: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  paypalSetExpressCheckoutResponse: {},
  old: {
    type: Boolean,
  default:
    false
  }
});

var PendingReceiptsSchema = new Schema({
  dateAdded: {
    type: Date,
  default:
    Date.now
  },
  userId: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  amount: Number,
  currencyCode: String,
  disputed: Date,
  old: {
    type: Boolean,
  default:
    false
  }
});

var EventSchema = new Schema({
  dateAdded: {
    type: Date,
  default:
    Date.now
  },
  host: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  name: String,
  image: {
    data: Buffer,
    contentType: String
  },
  description: String,
  date: Date,
  attendees: [AttendeeSchema],
  pendingPayments: [PendingPaymentsSchema],
  pendingReceipts: [PendingReceiptsSchema],
  hangout: String,
  complete: Date
});

EventSchema.method('failPayment', function(user, pendingPayment, reason, fn) {
  user.failedPayments.push({
    eventId: this._id,
    pendingPaymentId: pendingPayment._id,
    paypalSetExpressCheckoutResponse: pendingPayment.paypalSetExpressCheckoutResponse,
    reason: reason
  });
  user.save(function(error) {
    if (error) {
      fn(new Error('Failed to save failed payment on user'));
    } else {
      pendingPayment.old = true;
      this.save(fn);
    }
  });
});

EventSchema.method('confirmPayment', function(user, pendingPayment, doExpressCheckoutPaymentResponse, fn) {
  var event = this;
  event.pendingReceipts.push({
    userId: user._id,
    amount: 4,
    currencyCode: 'EUR'
  });
  event.save(function(error) {
    if (error) {
      fn(new Error('Failed to save pending receipt on event'));
    } else {
      user.payments.push({
        eventId: event._id,
        pendingPaymentId: pendingPayment._id,
        paypalSetExpressCheckoutResponse: pendingPayment.paypalSetExpressCheckoutResponse,
        doExpressCheckoutPaymentResponse: doExpressCheckoutPaymentResponse
      });
      user.save(function(error) {
        if (error) {
          fn(new Error('Failed to save payment on user'));
        } else {
          pendingPayment.old = true;
          event.save(fn);
        }
      });
    }
  });
});

EventSchema.method('getPendingReceipt', function(user) {
  var pendingReceipt = null;
  var index;
  for (index = 0; index < this.pendingReceipts.length; index++) {
    if (!this.pendingReceipts[index].old && this.pendingReceipts[index].userId.equals(user._id)) {
      pendingReceipt = this.pendingReceipts[index];
      break;
    }
  }
  return pendingReceipt;
});

EventSchema.method('confirmReceipt', function(user, fn) {
  var event = this;
  var pendingReceipt = event.getPendingReceipt(user);
  if (pendingReceipt) {
    var User = require('./user.js');
    User.findOne({
      _id: this.host
    }, function(error, host) {
      if (error) {
        fn(new Error('Could not find event host'));
      } else {
        host.receipts.push({
          eventId: event._id,
          pendingReceiptId: pendingReceipt._id,
          amount: pendingReceipt.amount,
          currencyCode: pendingReceipt.currencyCode
        });
        host.save(function(error) {
          if (error) {
            fn(new Error('Failed to save receipt on user'));
          } else {
            pendingReceipt.old = true;
            event.save(fn);
          }
        });
      }
    });
  } else {
    fn(new Error('Pending receipt not found'));
  }
});

EventSchema.method('disputeReceipt', function(user, fn) {
  var pendingReceipt = this.getPendingReceipt(user);
  if (pendingReceipt) {
    pendingReceipt.disputed = Date.now();
    this.save(fn);
  } else {
    fn(new Error('Pending receipt not found'));
  }
});

EventSchema.method('addPendingPayment', function(user, paypalSetExpressCheckoutResponse, fn) {
  if (this.host.equals(user._id)) {
    fn(new Error('User cannot attend an event that they are hosting'));
  } else {
    if (this.getAttendee(user) != null) {
      fn(new Error('User is already attending this event'));
    } else {
      if (this.attendees.length < config.maximumAttendees) {
        this.pendingPayments.push({
          userId: user._id,
          paypalSetExpressCheckoutResponse: paypalSetExpressCheckoutResponse
        });
        this.save(function(error, event) {
          if (error) {
            fn(error);
          } else {
            fn(null, event.getPendingPayment(user, paypalSetExpressCheckoutResponse.token));
          }
        });
      } else {
        fn(new Error('Maximum number of attendees has already been reached'));
      }
    }
  }
});

EventSchema.method('getPendingPayment', function(user, paypalToken) {
  var pendingPayment = null;
  var index;
  for (index = 0; index < this.pendingPayments.length; index++) {
    if (!this.pendingPayments[index].old && (this.pendingPayments[index].paypalSetExpressCheckoutResponse.token === paypalToken) && this.pendingPayments[index].userId.equals(user._id)) {
      pendingPayment = this.pendingPayments[index];
      break;
    }
  }
  return pendingPayment;
});

EventSchema.method('addAttendee', function(user, fn) {
  if (this.host.equals(user._id)) {
    fn(new Error('User cannot attend an event that they are hosting'));
  } else {
    if (this.getAttendee(user) != null) {
      fn(new Error('User is already attending this event'));
    } else {
      if (this.attendees.length < config.maximumAttendees) {
        this.attendees.push({
          userId: user._id
        });
        this.save(function(error, event) {
          if (error) {
            fn(error);
          } else {
            fn(null, event.getAttendee(user));
          }
        });
      } else {
        fn(new Error('Maximum number of attendees has already been reached'));
      }
    }
  }
});

EventSchema.method('removeAttendee', function(attendee, fn) {
  attendee.remove();
  this.save(fn);
});

EventSchema.method('getAttendee', function(user) {
  var attendee = null;
  var index;
  for (index = 0; index < this.attendees.length; index++) {
    if (this.attendees[index].userId.equals(user._id)) {
      attendee = this.attendees[index];
      break;
    }
  }
  return attendee;
});

EventSchema.method('setHangout', function(hangout, fn) {
  this.hangout = hangout;
  this.save(fn);
});

EventSchema.method('setComplete', function(fn) {
  this.complete = Date.now();
  this.save(fn);
});

EventSchema.method('resetAttendees', function(fn) {
  this.attendees = [];
  this.save(fn);
});

EventSchema.namedScope('hostedBy', function(user) {
  return this.where('host', user);
});

EventSchema.namedScope('attendedBy', function(user) {
  return this.where('attendees.userId', user);
});

module.exports = mongoose.model('Event', EventSchema);
