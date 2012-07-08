var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

var eventSchema = new Schema({
    host      : Schema.ObjectId
  , name      : String
  , image      : { data: Buffer, contentType: String }
  , description : String
  , date      : String
  , time      : String
  , attendees : [Schema.ObjectId]
  , hangout : String
});

module.exports = mongoose.model('Event', eventSchema);