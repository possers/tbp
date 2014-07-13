var http = require('http');
var Nconf = require('nconf');
var Express = require('express');
var ExpressSession = require('express-session');
var ExpressMethodOverride = require('express-method-override');
var CookieParser = require('cookie-parser');
var Passport = require('passport');
var TwitterStrategy = require('passport-twitter').Strategy;
//var User = require('./User');


Nconf.argv().env().file({ file: 'settings-local.json' });

var TWITTER_CONSUMER_KEY = Nconf.get('twitter_consumer_key');
var TWITTER_CONSUMER_SECRET = Nconf.get('twitter_consumer_secret');

var app = Express();

app.use(CookieParser());
app.use(ExpressMethodOverride());
app.use(ExpressSession({
	secret: Nconf.get('session_secret'),
	saveUninitialized: true,
	resave: true
}));

app.use(Passport.initialize());
app.use(Passport.session());

var server = app.listen(3000, '127.0.0.1', 511, onServerListening);


app.get('/', function(req, res) {
	if(req.user) {
		console.log('a user is logged in', req.user.name);
		res.send('hey ' + req.user.name + ' <a href="/logout">logout</a>');
	} else {
		console.log('not logged');
		res.send('heeey <a href="/login">login</a>');
	}
});


function onServerListening() {
	console.log('Listening on %d', server.address().port);
	console.log(server.address());
	setupTwitter();
}

// The twitterama ~~~~

var users = {}; // XXX FIXME use a proper database lol

function findUser(uid, callback) {
	var user = users[uid];
	callback(false, user);
}

function setupTwitter() {

	console.log('twitterarama!');

	var addr = server.address();

	// uhrrhghhg this is awful XXX FIXME FIXALLTHETHINGS
	var TWITTER_AUTH_PATH = '/auth/twitter';
	var TWITTER_AUTH_CALLBACK_PATH = '/auth/twitter/callback';
	var TWITTER_CALLBACK_URL = 'http://' + addr.address + ':' + addr.port + TWITTER_AUTH_CALLBACK_PATH;


	app.get('/login', function(req, res) {
		res.send('<a href="' + TWITTER_AUTH_PATH + '">login with twitter</a>');
	});

	Passport.use(new TwitterStrategy({
			consumerKey: TWITTER_CONSUMER_KEY,
			consumerSecret: TWITTER_CONSUMER_SECRET,
			callbackURL: TWITTER_CALLBACK_URL
		},
		function(token, tokenSecret, profile, done) {
			console.log(token, tokenSecret, profile);
			
			//User.findOrCreate(..., function(err, user) {
			//	if (err) { return done(err); }
			//	done(null, user);
			//});
			
			if(profile) {
				var user = {
					id: profile.id,
					name: profile.username,
					fullname: profile.displayName
				};

				var uid = user.id;

				// TODO create own id, don't rely on twitter's
				if(!users[uid]) {
					users[uid] = user;
				}

				done(null, user);
			} else {
				done(err);
			}

		}
	));



	app.get(TWITTER_AUTH_PATH, Passport.authenticate('twitter'));

	app.get(TWITTER_AUTH_CALLBACK_PATH,
		Passport.authenticate('twitter', { successRedirect: '/',
			failureRedirect: '/login'
	}));

	Passport.serializeUser(function(user, done) {
		console.log('serialize user', user);
		done(null, user.id);
	});

	Passport.deserializeUser(function(uid, done) {
		console.log('deserialize user', uid);
		findUser(uid, function (err, user) {
			done(err, user);
		});
	});
}

