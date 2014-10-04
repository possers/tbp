function index(request, reply) {
	console.log('sesion', request.session.get('authentication'));
	console.log('uh', request.session.get('sole'));
	
	if(request.auth.credentials) {
		reply('wow you are so authenticated');
	} else {
		reply('hullo <a href="/login">login please</a>');
	}
}

function login(request, reply) {
	// Perform any account lookup or registration, setup local session,
	// and redirect to the application. The third-party credentials are
	// stored in request.auth.credentials. Any query parameters from
	// the initial request are passed back via request.auth.credentials.query.
	
	if (!request.auth.isAuthenticated) {
		return reply('Authentication failed due to: ' + request.auth.error.message);
	}

	request.session.set('authentication', request.auth);
	request.session.set('sole', 'mola! ' + Date.now());
	
	return reply.redirect('/');
}


module.exports = {
	index: index,
	login: login
};
