var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var UserSchema = new Schema({
  id: String,
  name: String
});

UserSchema.statics.findOrCreateFromGoogleData = function(googleUserMetadata, promise) {
  this.findOne({
    id: googleUserMetadata.id
  }, function(error, user) {
    if (error) {
      promise.fail();
    } else {
      if (user) {
        promise.fulfill(user);
      } else {
        var newUser = new(mongoose.model('User', UserSchema))({
          id: googleUserMetadata.id,
          name: googleUserMetadata.name
        });
        newUser.save();
        promise.fulfill(newUser);
      }
    }
  });
};

module.exports = mongoose.model('User', UserSchema);
