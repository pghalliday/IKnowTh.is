var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var AttendeeSchema = new Schema({
  userId: Schema.ObjectId,
  paypalToken: String,
  confirmed: Boolean
});

var EventSchema = new Schema({
  test: String,
  host: Schema.ObjectId,
  name: String,
  image: {
    data: Buffer,
    contentType: String
  },
  description: String,
  date: String,
  time: String,
  attendees: [AttendeeSchema],
  hangout: String
});

EventSchema.methods.getAttendee = function(userId) {
  var attendee = null;
  var index;
  for (index = 0; index < this.attendees.length; index++) {
    if (this.attendees[index].userId.equals(userId)) {
      attendee = this.attendees[index];
      break;
    }
  }
  return attendee;
};

EventSchema.methods.resetAttendees = function() {
  this.attendees = [];
};

module.exports = mongoose.model('Event', EventSchema);
