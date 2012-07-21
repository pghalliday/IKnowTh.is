var mongoose = require('mongoose'),
    config = require('../config.js').properties,
    Schema = mongoose.Schema;

var AttendeeSchema = new Schema({
  userId: {type: Schema.ObjectId, ref: 'User'},
  paypalToken: String,
  confirmed: Boolean
});

var PendingPaymentsSchema = new Schema({
  userId: {type: Schema.ObjectId, ref: 'User'},
  paypalToken: String,
});

var EventSchema = new Schema({
  host: {type: Schema.ObjectId, ref: 'User'},
  name: String,
  image: {
    data: Buffer,
    contentType: String
  },
  description: String,
  date: Date,
  attendees: [AttendeeSchema],
  pendingPayments: [PendingPaymentsSchema],
  hangout: String
});

EventSchema.method('addAttendee', function(user, fn) {
  if (this.host.equals(user._id)) {
    fn(new Error('User cannot attend an event that they are hosting'));
  } else {
    if (this.getAttendee(user) != null) {
      fn(new Error('User is already attending this event')); 
    } else {
      if (this.attendees.length < config.maximumAttendees) {
        this.attendees.push({userId: user._id});
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
