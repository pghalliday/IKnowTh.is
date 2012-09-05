module.exports = function(startId) {
  var currentId = startId;
  
  this.next = function(callback) {
    callback(currentId++);
  };
};