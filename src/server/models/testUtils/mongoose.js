var mongoose = require('mongoose');
mongoose.resetSchemas = function() {
  this.modelSchemas = {};
  this.models = {};
};
module.exports = mongoose;
