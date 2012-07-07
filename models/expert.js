var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

var expertSchema = new Schema({
    name    	: String
  , expertise   : String
});

module.exports = mongoose.model('Expert', expertSchema);