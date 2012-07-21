/**
 * Module dependencies.
 */

var express = require('express'),
    homeRoutes = require('./routes/home.js'),
    userRoutes = require('./routes/user.js'),
    eventRoutes = require('./routes/event.js'),
    hangoutRoutes = require('./routes/hangout.js'),
    config = require('./config.js').properties,
    mongoose = require('mongoose'),
    mongooseAuth = require('mongoose-auth'),
    fs = require('fs'),
    User = require('./models/user.js');

var db = process.env.MONGOHQ_URL || 'mongodb://localhost/Hangout';
mongoose.connect(db);

var app = module.exports = express.createServer();

// Configuration
app.configure(function() {
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({
    secret: 'this is a secret'
  }));
  app.use(mongooseAuth.middleware());
  app.use(express.methodOverride());
  app.use(express.static(__dirname + '/../static'));
});

app.configure('development', function() {
  app.use(express.errorHandler({
    dumpExceptions: true,
    showStack: true
  }));
});

app.configure('production', function() {
  app.use(express.errorHandler());
});

// Routes
app.get('/', homeRoutes.home);
app.get('/event/:id', eventRoutes.event);
app.get('/event/:id/image', eventRoutes.eventImage);
app.get('/newEvent', eventRoutes.newEvent);
app.post('/addEvent', eventRoutes.addEvent);
app.get('/deleteEvent/:id', eventRoutes.deleteEvent);
app.get('/attendEvent/:eventId/:userId', eventRoutes.attendEvent);
app.get('/attendEventContinue/:eventId/:userId', eventRoutes.attendEventContinue);
app.get('/attendEventCancel/:eventId/:userId', eventRoutes.attendEventCancel);
app.post('/startEvent/:id', eventRoutes.startEvent);
app.get('/hangout', hangoutRoutes.hangout);
app.get('/hangoutxml', hangoutRoutes.hangoutxml);
app.get('/resetEvent/:id', eventRoutes.resetEvent);
app.get('/resetEvents', eventRoutes.resetEvents);
app.get('/resetDatabase', homeRoutes.resetDatabase);

mongooseAuth.helpExpress(app);

var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
