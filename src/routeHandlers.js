var config;

function refreshtimeline(creds) {
	var keys = {
		"consumer_key" : config.get('twitter_consumer_key'),
		"consumer_secret" : config.get('twitter_consumer_secret'),
		"access_token_key" : creds.token,
		"access_token_secret" : creds.secret
	};

	var tu = require('tuiter')(keys);
	
	/*tu.mentionsTimeline({ trim_user: true }, function(err, data) {
		console.log('mentionsss');
		if(err) {
			console.error('caca', err);
			return;
		}
		console.log(data);
	});*/

	tu.directMessages({}, function(err, data) {
		console.log('dms');
		if(err) {
			console.error('caca', err);
			return;
		}
		console.log(data);
	});
}

function index(request, reply) {

	var auth = request.session.get('authcredentials');

	if(auth) {
		// TODO reply with more context variables and stuff so the app can actually work client side
		reply.view('index', {
			username: auth.profile.username
		});
	} else {
		reply.view('logged-out');
	}

}

function login(request, reply) {

	if (!request.auth.isAuthenticated) {
		return reply('Authentication failed due to: ' + request.auth.error.message);
	}

	// TODO is this the best thing? advice gladly taken
	request.session.set('authcredentials', request.auth.credentials);

	// XXX refreshtimeline(request.auth.credentials);
	
	return reply.redirect('/');
}



module.exports = function getInstance(_config) {
	config = _config;

	return {
		index: index,
		login: login
	};

};

