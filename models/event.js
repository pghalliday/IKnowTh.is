var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

var eventSchema = new Schema({
    host      : Schema.ObjectId
  , name      : String
  , description : String
  , date      : String
  , time      : String
  , attendees : [Schema.ObjectId]
});

module.exports = mongoose.model('Event', eventSchema);