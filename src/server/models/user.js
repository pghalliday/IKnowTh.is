var mongoose = require('mongoose'),
    mongooseAuth = require('mongoose-auth'),
    config = require('../config.js').properties,
    Schema = mongoose.Schema,
    Event = require('./event.js'),
    User;

var UserSchema = new Schema({});

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
      scope: 'https://www.googleapis.com/auth/userinfo.profile'
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

UserSchema.methods.attend = function(event, fn) {
  event.addAttendee(this, fn);
};

UserSchema.methods.getAttendedEvents = function(fn) {
  Event.attendedBy(this).find({}, fn);
};

User = mongoose.model('User', UserSchema);
module.exports = User;
