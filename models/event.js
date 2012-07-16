var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

var Attendee = new Schema({
	  userId: Schema.ObjectId
	, paypalToken: String
	, confirmed: Boolean	
})

var Event = new Schema({
    host      : Schema.ObjectId
  , name      : String
  , image      : { data: Buffer, contentType: String }
  , description : String
  , date      : String
  , time      : String
  , attendees : [Attendee]
  , hangout : String
});

Event.methods.getAttendee = function(userId) {
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

Event.methods.resetAttendees = function() {
	this.attendees = [];
};

module.exports = mongoose.model('Event', Event);
