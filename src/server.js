var http = require('http');
var Nconf = require('nconf');
var Express = require('express');
var ExpressSession = require('express-session');
var Passport = require('passport');
var TwitterStrategy = require('passport-twitter').Strategy;

Nconf.argv().env().file({ file: 'settings-local.json' });

var TWITTER_CONSUMER_KEY = Nconf.get('twitter_consumer_key');
var TWITTER_CONSUMER_SECRET = Nconf.get('twitter_consumer_secret');

var app = Express();

app.use(ExpressSession({
	secret: Nconf.get('session_secret'),
	saveUninitialized: true,
	resave: true
}));

var server = app.listen(3000, '127.0.0.1', 511, onServerListening);


app.get('/', function(req, res) {
	res.send('heeey <a href="/login">login</a>');
});


function onServerListening() {
	console.log('Listening on %d', server.address().port);
	console.log(server.address());
	setupTwitter();
}

// The twitterama ~~~~
function setupTwitter() {

	console.log('twitterarama!');

	var addr = server.address();

	// uhrrhghhg this is awful XXX FIXME
	var TWITTER_AUTH_PATH = '/auth/twitter';
	var TWITTER_AUTH_CALLBACK_PATH = '/auth/twitter/callback';
	var TWITTER_CALLBACK_URL = 'http://' + addr.address + ':' + addr.port + TWITTER_AUTH_CALLBACK_PATH;

	app.get('/login', function(req, res) {
		res.send('<a href="' + TWITTER_AUTH_PATH + '">login with twitter</a>');
	});

	console.log(TWITTER_CALLBACK_URL);

	Passport.use(new TwitterStrategy({
			consumerKey: TWITTER_CONSUMER_KEY,
			consumerSecret: TWITTER_CONSUMER_SECRET,
			callbackURL: TWITTER_CALLBACK_URL
		},
		function(token, tokenSecret, profile, done) {
			//User.findOrCreate(..., function(err, user) {
			//	if (err) { return done(err); }
			//	done(null, user);
			//});
			console.log(token, tokenSecret, profile);
		}
	));



	app.get(TWITTER_AUTH_PATH, Passport.authenticate('twitter'));

	app.get(TWITTER_AUTH_CALLBACK_PATH,
		Passport.authenticate('twitter', { successRedirect: '/',
			failureRedirect: '/login'
	}));

}

