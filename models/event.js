var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

var eventSchema = new Schema({
    name  : String
  , date  : String
  , time  : String
});

module.exports = mongoose.model('Event', eventSchema);