var Application = require('./application.js');
var application = new Application();
application.start(function() {
  console.log("Application started");
});
