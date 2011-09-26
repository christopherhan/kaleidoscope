
/**
 * Module dependencies.
 */

var express = require('express'),
	http = require('http'),
	https = require('https'),
	io = require('socket.io'),
	sys = require('sys'),
	twit_node = require('twitter-node').TwitterNode

var app = module.exports = express.createServer();

var ALPHABET = {'-': 62, '1': 53, '0': 52, '3': 55, '2': 54, '5': 57, '4': 56, '7': 59, '6': 58, '9': 61, '8': 60, 'A': 0, 'C': 2, 'B': 1, 'E': 4, 'D': 3, 'G': 6, 'F': 5, 'I': 8, 'H': 7, 'K': 10, 'J': 9, 'M': 12, 'L': 11, 'O': 14, 'N': 13, 'Q': 16, 'P': 15, 'S': 18, 'R': 17, 'U': 20, 'T': 19, 'W': 22, 'V': 21, 'Y': 24, 'X': 23, 'Z': 25, '_': 63, 'a': 26, 'c': 28, 'b': 27, 'e': 30, 'd': 29, 'g': 32, 'f': 31, 'i': 34, 'h': 33, 'k': 36, 'j': 35, 'm': 38, 'l': 37, 'o': 40, 'n': 39, 'q': 42, 'p': 41, 's': 44, 'r': 43, 'u': 46, 't': 45, 'w': 48, 'v': 47, 'y': 50, 'x': 49, 'z': 51};

var INSTAGRAM_CLIENT = '';
var INSTAGRAM_SECRET = '';
var TWITTER_USERNAME = '';
var TWITTER_PASSWORD = '';

function decode(s) {
	var n = 0;
	for(var i=0; i < s.length; i++){
		var c = s.charAt(i);
		n = n * 64 + ALPHABET[c];
	}
	return n;
} 

// Configuration
app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true })); 
});

app.configure('production', function(){
  app.use(express.errorHandler()); 
});

// Routes

app.get('/', function(req, res){
  res.render('index', {
    title: 'Kaleidoscope | Real Time Instagram Photos'
  });
});

app.listen(3000);
io = io.listen(app)
var config = {user: TWITTER_USERNAME, password: TWITTER_PASSWORD, track:['instagr']};
var twit = new (twit_node)(config);

io.on('connection', function(client){
	sys.puts('connected');
});

var pattern = new RegExp('http://instagr\.am/p/([a-zA-Z0-9_-]+)/');
var pattern2 = new RegExp('http://t\.co/([a-zA-Z0-9]+)');

var options = {
	host: 'api.instagram.com',
	port: '443',
	path: '',
	method: 'GET'
};
twit
	.addListener('error', function(error) {
		console.log(error);
	})
	.addListener('tweet', function(tweet) {	
		var t = eval('('+JSON.stringify(tweet)+')');
		if (t.text != 'undefined') {
			var m = pattern.exec(t.text);
			
			sys.puts('m:', m, 'text', t.text);
			var media_id = decode(m[1]);
		}
		options['path'] = '/v1/media/'+media_id+'?client_id='+INSTAGRAM_CLIENT; 

		var req = https.request(options, function(res) {
			sys.puts('sending.statuscode '+res.statusCode);
			res.on('data', function(d) {
				try {
					result = JSON.parse(d);
					io.broadcast(result.data);
				}
				catch(err) {
					sys.puts('error');
				}
				
			});
		});
		req.end();

			
	})
	.addListener('end', function(resp) {
		sys.puts('goodbye ' + resp.statusCode);
	})
	.stream();


console.log("Express server listening on port %d", app.address().port);

