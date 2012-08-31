module.exports = function() {
  /**
   * Module dependencies.
   */

  var express = require('express'),
      homeRoutes = require('./routes/home.js'),
      userRoutes = require('./routes/user.js'),
      eventRoutes = require('./routes/event.js'),
      hangoutRoutes = require('./routes/hangout.js'),
      config = require(process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'] + '/.iknowth.is/config.js').properties,
      mongoose = require('mongoose'),
      mongooseAuth = require('mongoose-auth'),
      fs = require('fs'),
      User = require('./models/user.js');

  var db = process.env.MONGOHQ_URL || config.databaseUrl || 'mongodb://localhost/IKnowThis';
  mongoose.connect(db);

  var app = module.exports = express.createServer();

  // Configuration
  app.configure(function() {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.session({
      secret: '25Y3d3ldKn9tb0EZ'
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
  app.get('/attendEvent/:id', eventRoutes.attendEvent);
  app.get('/attendEventContinue/:id', eventRoutes.attendEventContinue);
  app.get('/attendEventCancel/:id', eventRoutes.attendEventCancel);
  app.post('/startEvent/:id', eventRoutes.startEvent);
  app.get('/completeEvent/:id', eventRoutes.completeEvent);
  app.get('/confirmReceipt/:id', eventRoutes.confirmReceipt);
  app.get('/disputeReceipt/:id', eventRoutes.disputeReceipt);
  app.get('/hangout', hangoutRoutes.hangout);
  app.get('/hangoutxml', hangoutRoutes.hangoutxml);
  app.get('/resetDatabase', homeRoutes.resetDatabase);
  app.get('/user', userRoutes.user);

  // super user routes
  app.get('/resetEvent/:id', eventRoutes.resetEvent);
  app.get('/resetEvents', eventRoutes.resetEvents);

  mongooseAuth.helpExpress(app);

  var port = process.env.PORT || config.port || 3000;
  
  this.start = function(callback) {
    app.listen(port, function() {
      console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
      callback();
    });
  };
  
  this.stop = function(callback) {
    app.close(callback);
  };
};


