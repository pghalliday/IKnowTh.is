module.exports = function() {
  /**
   * Module dependencies.
   */

  var express = require('express'),
      http = require('http'),
      homeRoutes = require('./routes/home.js'),
      userRoutes = require('./routes/user.js'),
      eventRoutes = require('./routes/event.js'),
      hangoutRoutes = require('./routes/hangout.js'),
      config = require(process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'] + '/.iknowth.is/config.js').properties,
      mongoose = require('mongoose'),
      everyauth = require('everyauth'),
      fs = require('fs'),
      User = require('./models/user.js'),
      Event = require('./models/event.js'),
      Payment = require('./models/payment.js');

  var port = process.env.PORT || config.port || 3000;
  var db = process.env.MONGOHQ_URL || config.databaseUrl || 'mongodb://localhost/IKnowThis';
  var app = express();
  var server = http.createServer(app);

  everyauth.everymodule.findUserById(function(userId, callback) {
    console.log('**********************************************************');
    User.findOne({
      id: userId
    }, function(err, user) {
      console.log(err);
      console.log(user);
      callback(err, user);
    });
  });

  everyauth.google
    .appId(config.googleAuthAppId)
    .appSecret(config.googleAuthAppSecret)
    .scope('https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email') // What you want access to
    .handleAuthCallbackError( function (req, res) {
      /* TODO */
      // If a user denies your app, Google will redirect the user to
      // /auth/facebook/callback?error=access_denied
      // This configurable route handler defines how you want to respond to
      // that.
      // If you do not configure this, everyauth renders a default fallback
      // view notifying the user that their authentication failed and why.
    })
    .findOrCreateUser( function (session, accessToken, accessTokenExtra, googleUserMetadata) {
      var promise = this.Promise();
      User.findOrCreateFromGoogleData(googleUserMetadata, promise);
      return promise;
    })
    .redirectPath('/');

  // Configuration
  app.configure(function() {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    
    app
      .use(express.bodyParser())
      .use(express.cookieParser())
      .use(express.session({
        secret: '25Y3d3ldKn9tb0EZ'
      }))
      .use(everyauth.middleware(app))
      .use(express.methodOverride())
      .use(express.static(__dirname + '/../static'));
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
  app.get('/hangout', (new (require('./routes/Hangout'))(config.title)).get);
  app.get('/hangoutxml', (new (require('./routes/HangoutXml'))(fs, config.baseUrl)).get);
  app.post('/googleWalletPostback', (new (require('./routes/GoogleWalletPostback'))('secret', User, Event, Payment)).post);
  app.get('/user', userRoutes.user);

  // super user routes
  app.get('/resetEvent/:id', eventRoutes.resetEvent);
  app.get('/resetEvents', eventRoutes.resetEvents);
  app.get('/resetDatabase', homeRoutes.resetDatabase);
  
  this.start = function(callback) {
    mongoose.connect(db, function() {
      server.listen(port, function() {
        console.log("Express server listening on port %d in %s mode", server.address().port, app.settings.env);
        callback();
      });
    });
  };
  
  this.stop = function(callback) {
    server.close(function () {
      mongoose.disconnect(callback);
    });
  };
};


