var Hapi = require('hapi');
var nconf = require('nconf');
var server = new Hapi.Server(3000);

/*server.start(function () {
	console.log('Server running at:', server.info.uri);
});*/

nconf.argv().env().file({ file: 'settings-local.json' });

var TWITTER_CONSUMER_KEY = nconf.get('twitter_consumer_key');
var TWITTER_CONSUMER_SECRET = nconf.get('twitter_consumer_secret');
var COOKIE_ENCRYPTION_PASSWORD = 'whaaaateveeer,changethis!!!';


server.route({
	method: ['GET'],
	path: '/',
	handler: function(request, reply) {
		console.log(request.auth);
		if(request.auth.credentials) {
			reply('wow you are so authenticated');
		} else {
			reply('hullo <a href="/login">login please</a>');
		}
	}
});

server.pack.register(require('bell'), function (err) {
	
	server.auth.strategy('twitter', 'bell', {
		provider: 'twitter',
		password: 'cookie_encryption_password',
		clientId: TWITTER_CONSUMER_KEY,
		clientSecret: TWITTER_CONSUMER_SECRET,
		isSecure: false     // TODO change to true if using https in server proto
	});


	server.route({
		method: ['GET', 'POST'], // Must handle both GET and POST
		path: '/login',          // The callback endpoint registered with the provider
		config: {
			auth: {
				strategy: 'twitter',
				mode: 'try'
			},
			handler: function (request, reply) {

				// Perform any account lookup or registration, setup local session,
				// and redirect to the application. The third-party credentials are
				// stored in request.auth.credentials. Any query parameters from
				// the initial request are passed back via request.auth.credentials.query.
				
				if (!request.auth.isAuthenticated) {
					return reply('Authentication failed due to: ' + request.auth.error.message);
				}
				return reply.redirect('/');
			}
		}
	});

	server.start(function() { console.log('si', server.info.uri); });
});
