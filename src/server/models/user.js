var mongoose = require('mongoose'),
    mongooseAuth = require('mongoose-auth'),
    config = require(process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME'] + '/.iknowth.is/config.js').properties,
    Schema = mongoose.Schema,
    Event = require('./event.js'),
    payflowpro = require('paynode').use('payflowpro'),
    User;

var paypalClient = payflowpro.createClient({
  level: (config.paypalLevel === 'live' ? payflowpro.levels.live : payflowpro.levels.sandbox),
  user: config.paypalUser,
  password: config.paypalPassword,
  signature: config.paypalSignature
});

var FailedPaymentSchema = new Schema({
  dateAdded: {
    type: Date,
  default:
    Date.now
  },
  eventId: {
    type: Schema.ObjectId,
    ref: 'Event'
  },
  pendingPaymentId: Schema.ObjectId,
  paypalSetExpressCheckoutResponse: {},
  reason: String
});

var PaymentSchema = new Schema({
  dateAdded: {
    type: Date,
  default:
    Date.now
  },
  eventId: {
    type: Schema.ObjectId,
    ref: 'Event'
  },
  pendingPaymentId: Schema.ObjectId,
  paypalSetExpressCheckoutResponse: {},
  doExpressCheckoutPaymentResponse: {}
});

var ReceiptSchema = new Schema({
  dateAdded: {
    type: Date,
  default:
    Date.now
  },
  eventId: {
    type: Schema.ObjectId,
    ref: 'Event'
  },
  pendingReceiptId: Schema.ObjectId,
  amount: Number,
  currencyCode: String
});

var UserSchema = new Schema({
  dateAdded: {
    type: Date,
  default:
    Date.now
  },
  failedPayments: [FailedPaymentSchema],
  payments: [PaymentSchema],
  receipts: [ReceiptSchema]
});

UserSchema.plugin(mongooseAuth, {
  everymodule: {
    everyauth: {
      User: function() {
        return User;
      }
    }
  },
  google: {
    everyauth: {
      myHostname: config.baseUrl,
      appId: config.googleAppId,
      appSecret: config.googleAppSecret,
      redirectPath: '/',
      scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email'
    }
  }
});

UserSchema.methods.host = function(eventData, fn) {
  eventData.host = this;
  var event = new Event(eventData);
  event.save(fn);
};

UserSchema.methods.getHostedEvents = function(fn) {
  Event.hostedBy(this).find({}, fn);
};

UserSchema.methods.pendPayment = function(event, fn) {
  // start the paypal transaction
  var user = this;
  paypalClient.setExpressCheckout({
    returnurl: config.baseUrl + '/attendEventContinue/' + event._id,
    cancelurl: config.baseUrl + '/attendEventCancel/' + event._id,
    paymentrequest: [{
      amt: '5.00',
      currencyCode: 'EUR',
      paymentAction: 'Sale'
    }]
  }).on('success', function(response) {
    event.addPendingPayment(user, response, fn);
  }).on('failure', function(response) {
    fn(new Error('Failed to set express checkout information: ' + response.errors));
  });
};

UserSchema.methods.confirmPayment = function(event, paypalCheckoutParams, fn) {
  var user = this;
  var pendingPayment = event.getPendingPayment(user, paypalCheckoutParams.token);
  if (pendingPayment !== null) {
    // add attendee
    user.attend(event, function(error, attendee) {
      if (error) {
        // log a failed payment with reason
        event.failPayment(user, pendingPayment, 'Could not add attendee: ' + error, function() {
          // TODO: are we sure we don't want to handle errors here! (it's true there shouldn't be any :s)
          fn(error);
        });
      } else {
        paypalClient.doExpressCheckoutPayment({
          token: paypalCheckoutParams.token,
          payerid: paypalCheckoutParams.PayerID,
          paymentrequest: [{
            amt: '5.00',
            currencyCode: 'EUR',
            paymentAction: 'Sale'
          }]
        }).on('success', function(response) {
          // log the successful payment
          event.confirmPayment(user, pendingPayment, response, function() {
            // TODO: are we sure we don't want to handle errors here! (it's true there shouldn't be any :s)
            fn(null, attendee);
          });
        }).on('failure', function(response) {
          // log a failed payment with reason
          event.failPayment(user, pendingPayment, 'doExpressCheckoutPayment returned failure: ' + response.errors, function() {
            // TODO: are we sure we don't want to handle errors here! (it's true there shouldn't be any :s)
            // remove the attendee from the event
            event.removeAttendee(attendee, function() {
              // TODO: are we sure we don't want to handle errors here! (it's true there shouldn't be any :s)
              fn(new Error('Failed to set doExpressCheckoutPayment: ' + response.errors));
            });
          });
        });
      }
    });
  } else {
    fn(new Error('Failed to find pending payment'));
  }
};

UserSchema.methods.cancelPayment = function(event, paypalCheckoutParams, fn) {
  var pendingPayment = event.getPendingPayment(this, paypalCheckoutParams.token);
  if (pendingPayment !== null) {
    // log a failed payment with reason
    event.failPayment(this, pendingPayment, 'Payment cancelled', function() {
      // TODO: are we sure we don't want to handle errors here! (it's true there shouldn't be any :s)
      fn();
    });
  } else {
    fn(new Error('Failed to find pending payment'));
  }
};

UserSchema.methods.attend = function(event, fn) {
  event.addAttendee(this, fn);
};

UserSchema.methods.getAttendedEvents = function(fn) {
  Event.attendedBy(this).find({}, fn);
};

User = mongoose.model('User', UserSchema);
module.exports = User;
