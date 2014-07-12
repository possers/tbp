var Express = require('express');

var app = Express();

app.get('/', function(req, res) {
	res.send('heeey');
});

var server = app.listen(3000, function() {
	console.log('Listening on %d', server.address().port);
});
