var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var PaymentSchema = new Schema({
  dateAdded: {
    type: Date,
  default:
    Date.now
  },
  user: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  event: {
    type: Schema.ObjectId,
    ref: 'Event'
  }
});

module.exports = mongoose.model('Payment', PaymentSchema);
