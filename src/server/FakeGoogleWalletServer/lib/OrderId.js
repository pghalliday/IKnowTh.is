module.exports = function(startId) {
  var nextId = startId;
  
  this.next = function() {
    this.currentId = nextId;
    return nextId++;
  };
};