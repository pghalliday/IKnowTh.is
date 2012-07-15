/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , mongoose = require('mongoose')
  , everyauth = require('everyauth')
  , fs = require('fs')
  , User = require('./models/user.js');

/*********************

config is stored in a file called config.js in the following format:

config = {
    title: '<The application title>'
  , googleAppId: '<From the google API console for authentication>'
  , googleAppSecret: '<From the google API console for authentication>'
  , googleProjectId: <From the google API console for the hangout app>'
  , googleHangoutUrl: 'https://hangoutsapi.talkgadget.google.com/hangouts' // for the sandbox or 'https://plus.google.com/hangouts/_' for a published hangout app
  , googleHangoutIFrameUrl: 'http://<host name>/hangout' // Only used if the hangout URL set in the hangout app in the google API console is set to http://<host name>/hangoutxml
}
*********************/
eval(fs.readFileSync('config.js', encoding="ascii"));
routes.config = config;

everyauth.google
  .appId(config.googleAppId)
  .appSecret(config.googleAppSecret)
  .scope('https://www.googleapis.com/auth/userinfo.profile') // What you want access to
  .handleAuthCallbackError( function (req, res) {
    // If a user denies your app, Google will redirect the user to
    // /auth/google/callback?error=access_denied
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
  
var db = process.env.MONGOHQ_URL || 'mongodb://localhost/Hangout';
mongoose.connect(db);

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({secret: 'this is a secret'}));
  app.use(everyauth.middleware());
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
app.get('/event/:id/image', routes.eventImage);
app.get('/newEvent', routes.newEvent);
app.post('/addEvent', routes.addEvent);
app.get('/deleteEvent/:id', routes.deleteEvent);
app.get('/attendEvent/:id', routes.attendEvent);
app.post('/startEvent/:id', routes.startEvent);
app.get('/hangout', routes.hangout);

// hangout xml route
app.get('/hangoutxml', function(req, res) {
	var xml = fs.readFileSync('hangout.xml');
	xml = xml.replace('IFRAMEURL', config.googleHangoutIFrameUrl);
});

everyauth.helpExpress(app);
everyauth.everymodule.findUserById( function (userId, callback) {
  User.findOne( {id: userId}, callback );
  // callback has the signature, function (err, user) {...}
});

var port = process.env.PORT || 3000;
app.listen(port, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});

