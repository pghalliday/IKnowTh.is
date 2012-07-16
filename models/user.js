var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

var User = new Schema({
    id    : String
  , name  : String
});

User.statics.findOrCreateFromGoogleData = function(googleUserMetadata, promise) {
  this.findOne({id: googleUserMetadata.id}, function(error, user) {
    if (error) {
      promise.fail();
    } else {
      if (user) {
        promise.fulfill(user);
      } else {
        var newUser = new User({id: googleUserMetadata.id, name: googleUserMetadata.name});
        newUser.save();
        promise.fulfill(newUser);
      }
    }
  });
}

module.exports = mongoose.model('User', User);
