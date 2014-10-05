var nconf = require('nconf');
var Hapi = require('hapi');

nconf.argv().env().file({ file: 'settings-local.json' });


var routeHandlers = require('./routeHandlers')(nconf);

var TWITTER_CONSUMER_KEY = nconf.get('twitter_consumer_key');
var TWITTER_CONSUMER_SECRET = nconf.get('twitter_consumer_secret');
var COOKIE_ENCRYPTION_PASSWORD = nconf.get('cookie_encryption_password');
var PRODUCTION = nconf.get('production');
var COOKIES_ARE_SECURE = PRODUCTION; // TODO change to true if using https in server proto

var serverOptions = {
	views: {
		engines: {
			html: require('handlebars')
		},
		basePath: __dirname,
		path: './templates',
		layoutPath: './templates/layouts',
		// partialsPath
		helpersPath: './templates/helpers',
		layout: 'default',
		isCached: !PRODUCTION
	}
};

var server = new Hapi.Server(3000, serverOptions);

server.route({
	method: ['GET'],
	path: '/',
	handler: routeHandlers.index
});

server.pack.register([
		{ plugin: require('bell') },
		{
			plugin: require('yar'),
			options: {
				cookieOptions: {
					password: COOKIE_ENCRYPTION_PASSWORD,
					isSecure: COOKIES_ARE_SECURE
				}
			}
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

