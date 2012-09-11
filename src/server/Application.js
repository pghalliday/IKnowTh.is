module.exports = function() {
  /**
   * Module dependencies.
   */

  var express = require('express'),
      http = require('http'),
      homeRoutes = require('./routes/home.js'),
      userRoutes = require('./routes/user.js'),
      eventRoutes = require('./routes/event.js'),
      config = require(process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'] + '/.iknowth.is/config.js').properties,
      mongoose = require('mongoose'),
      passport = require('passport'),
      GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
      fs = require('fs'),
      User = require('./models/user.js'),
      Event = require('./models/event.js'),
      Payment = require('./models/payment.js');
      
  var port = process.env.PORT || config.port || 3000;
  var db = process.env.MONGOHQ_URL || config.databaseUrl || 'mongodb://localhost/IKnowThis';
  var app = express();
  var server = http.createServer(app);

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findOne({
      id: id
    }, done);
  });

  passport.use(new GoogleStrategy({
      clientID: config.googleAuthAppId,
      clientSecret: config.googleAuthAppSecret,
      callbackURL: '/auth/google/callback'
    },
    function(token, tokenSecret, profile, done) {
      User.findOrCreateFromGoogleData(profile, function(err, user) {
        return done(err, user);
      });
    }
  ));
  
  // Configuration
  app.configure(function() {
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    
    app
      .use(express.static(__dirname + '/../static'))
      .use(express.bodyParser())
      .use(express.cookieParser())
      .use(express.session({
        secret: '25Y3d3ldKn9tb0EZ'
      }))
      .use(express.methodOverride())
      .use(passport.initialize())
      .use(passport.session());
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

  // authentication routes
  app.get('/auth/google',
    passport.authenticate('google', {
      scope: [
        'https://www.googleapis.com/auth/userinfo.profile',
        'https://www.googleapis.com/auth/userinfo.email'
      ]
    }),
    function(req, res){
      // The request will be redirected to Google for authentication, so this
      // function will not be called.
    });

  app.get('/auth/google/callback', 
    passport.authenticate('google', {
      failureRedirect: '/'
    }),
    function(req, res) {
      res.redirect('/');
    });

  app.get('/logout', function(req, res){
    req.logout();
    res.redirect('/');
  });  

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


