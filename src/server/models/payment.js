var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Payment;

var PaymentSchema = new Schema({
  dateAdded: {
    type: Date,
  default:
    Date.now
  },
  attendee: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  event: {
    type: Schema.ObjectId,
    ref: 'Event'
  },
  details: {}
});

PaymentSchema.statics.processPayment = function(event, attendee, details, callback) {
  // check that the attendee is not the host
  if (attendee._id === event.host) {
    var error = new Error('Host cannot pay to attend their own event');
    callback(error);
  } else {
    // check that the attendee has not already paid
    Payment.findOne({
      attendee: attendee._id,
      event: event._id
    }, function(error, payment) {
      if (error) {
        callback(error);
      } else {
        if (payment) {
          error = new Error('Attendee cannot pay for an event twice');
          callback(error, payment);
        } else {
          // payment can be processed
          payment = new Payment({
            attendee: attendee._id,
            event: event._id,
            details: details
          });
          payment.save(function(error) {
            if (error) {
              callback(error);
            } else {
              callback(null, payment);
            }
          });
        }
      }
    });
  }
};

Payment = module.exports = mongoose.model('Payment', PaymentSchema);

