/**
 * Module dependencies.
 */

var express = require('express'),
	routes = require('./routes'),
	config = require('./config.js').properties,
	mongoose = require('mongoose'),
	everyauth = require('everyauth'),
	fs = require('fs'),
	User = require('./models/user.js');

everyauth.google.appId(config.googleAppId).appSecret(config.googleAppSecret).scope('https://www.googleapis.com/auth/userinfo.profile') // What you want access to
.handleAuthCallbackError(function(req, res) {
	// If a user denies your app, Google will redirect the user to
	// /auth/google/callback?error=access_denied
	// This configurable route handler defines how you want to respond to
	// that.
	// If you do not configure this, everyauth renders a default fallback
	// view notifying the user that their authentication failed and why.
}).findOrCreateUser(function(session, accessToken, accessTokenExtra, googleUserMetadata) {
	var promise = this.Promise();
	User.findOrCreateFromGoogleData(googleUserMetadata, promise);
	return promise;
}).redirectPath('/');

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
	app.use(everyauth.middleware());
	app.use(express.methodOverride());
	app.use(app.router);
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
app.get('/', routes.index);
app.get('/event/:id', routes.event);
app.get('/event/:id/image', routes.eventImage);
app.get('/newEvent', routes.newEvent);
app.post('/addEvent', routes.addEvent);
app.get('/deleteEvent/:id', routes.deleteEvent);
app.get('/attendEvent/:eventId/:userId', routes.attendEvent);
app.get('/attendEventContinue/:eventId/:userId', routes.attendEventContinue);
app.get('/attendEventCancel/:eventId/:userId', routes.attendEventCancel);
app.post('/startEvent/:id', routes.startEvent);
app.get('/hangout', routes.hangout);
app.get('/hangoutxml', routes.hangoutxml);
app.get('/resetEvent/:id', routes.resetEvent);

everyauth.helpExpress(app);
everyauth.everymodule.findUserById(function(userId, callback) {
	User.findOne({
		id: userId
	}, callback);
	// callback has the signature, function (err, user) {...}
});

var port = process.env.PORT || 3000;
app.listen(port, function() {
	console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});