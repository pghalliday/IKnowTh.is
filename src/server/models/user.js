var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    Event = require('./event.js');

var UserSchema = new Schema({
  id: String,
  name: String,
});

UserSchema.statics.findOrCreateFromGoogleData = function(googleUserMetadata, promise) {
  this.findOne({
    id: googleUserMetadata.id
  }, function(error, user) {
    if (error) {
      promise.fail(error);
    } else {
      if (user) {
        promise.fulfill(user);
      } else {
        var newUser = new(mongoose.model('User', UserSchema))({
          id: googleUserMetadata.id,
          name: googleUserMetadata.name
        });
        newUser.save(function(error, user) {
          if (error) {
            promise.fail(error);
          } else {
            promise.fulfill(user);
          }
        });
      }
    }
  });
};

UserSchema.methods.host = function(eventData, fn) {
  eventData.host = this;
  var event = new Event(eventData);
  event.save(fn);
};

UserSchema.methods.getHostedEvents = function(fn) {
  Event.hostedBy(this).find({}, fn);
};

UserSchema.methods.attend = function(event, fn) {
  event.addAttendee(this, fn);
};

UserSchema.methods.getAttendedEvents = function(fn) {
  Event.attendedBy(this).find({}, fn);
};

module.exports = mongoose.model('User', UserSchema);
