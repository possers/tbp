function index(request, reply) {

	var auth = request.session.get('authcredentials');

	if(auth) {
		reply('wow you are so authenticated! ' + auth.profile.username);
	} else {
		reply('hullo <a href="/login">login please</a>');
	}

}

function login(request, reply) {

	if (!request.auth.isAuthenticated) {
		return reply('Authentication failed due to: ' + request.auth.error.message);
	}

	// TODO is this the best thing? advice gladly taken
	request.session.set('authcredentials', request.auth.credentials);
	
	return reply.redirect('/');
}


module.exports = {
	index: index,
	login: login
};
