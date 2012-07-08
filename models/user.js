var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

var userSchema = new Schema({
    id    : String
  , name  : String
});

var User = module.exports = mongoose.model('User', userSchema);
User.findOrCreateFromGoogleData = function(googleUserMetadata, promise) {
  User.findOne({id: googleUserMetadata.id}, function(error, user) {
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
