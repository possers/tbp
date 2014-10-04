var nconf = require('nconf');
var Hapi = require('hapi');
var routeHandlers = require('./routeHandlers');
var server = new Hapi.Server(3000);

nconf.argv().env().file({ file: 'settings-local.json' });

var TWITTER_CONSUMER_KEY = nconf.get('twitter_consumer_key');
var TWITTER_CONSUMER_SECRET = nconf.get('twitter_consumer_secret');
var COOKIE_ENCRYPTION_PASSWORD = 'whaaaateveeer,changethis!!!';
var COOKIES_ARE_SECURE = false; // TODO change to true if using https in server proto


server.route({
	method: ['GET'],
	path: '/',
	handler: routeHandlers.index
});

server.pack.register([
		{ plugin: require('bell') },
		// { plugin: require('hapi-auth-cookie') }
		{
			plugin: require('yar'),
			options: { cookieOptions: { password: COOKIE_ENCRYPTION_PASSWORD } }
		}
	], 
	function (err) {
	
		server.auth.strategy('twitter', 'bell', {
			provider: 'twitter',
			password: COOKIE_ENCRYPTION_PASSWORD,
			clientId: TWITTER_CONSUMER_KEY,
			clientSecret: TWITTER_CONSUMER_SECRET,
			isSecure: COOKIES_ARE_SECURE
		});

		server.route({
			method: ['GET', 'POST'], // Must handle both GET and POST
			path: '/login',          // The callback endpoint registered with the provider
			config: {
				auth: {
					strategy: 'twitter',
					mode: 'try'
				},
				handler: routeHandlers.login
			}
		});

		server.start(function() { console.log('si', server.info.uri); });

	}
);
