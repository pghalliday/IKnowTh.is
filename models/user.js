var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

var userSchema = new Schema({
    googleId  : String
  , name      : String
});

var User = mongoose.model('User', userSchema);
User.findOrCreateFromGoogleData = function(googleUserMetadata, promise) {
  User.findOne({googleId: googleUserMetadata.id}, function(error, user) {
    if (error) {
      promise.fail();
    } else {
      if (user) {
        promise.fulfill(user);
      } else {
        var newUser = new User({googleId: googleUserMetadata.id, name: googleUserMetadata.name});
        newUser.save();
        promise.fulfill(newUser);
      }
    }
  });
}

module.exports = User;
