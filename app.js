
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , mongoose = require('mongoose');

var db = process.env.MONGOHQ_URL || 'mongodb://localhost/Hangout';
mongoose.connect(db);

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', routes.index);
app.get('/editEvent/:id', routes.editEvent);
app.get('/event/:id', routes.event);
app.get('/addEvent', routes.addEvent);
app.post('/addEvent', routes.addEventPost);
app.get('/deleteEvent/:id', routes.deleteEvent);

var port = process.env.PORT || 3000;
app.listen(port, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
