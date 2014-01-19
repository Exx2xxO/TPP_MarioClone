var http = require('http');
var connect = require('connect');

var app = connect()
	.use(connect.logger('dev'))
	.use(connect.static('public'))
	.use(function(req, res){
		res.writeHeader(404);
		res.write('Nothing found.');
		res.end();
	})

var server = http.createServer(app).listen(1337);
var io = require('socket.io').listen(server);

io.sockets.on('connection', function(socket){
	socket.on('getAtlas', function(data){
		console.log('ICH HABE DICH ERHÖRT MEIN JUNGE!');
		var atlasFile = require('./public/res/atlas.json');
		var atlases = {};
		var numLoaded = 0;
		for(var list in atlasFile) {
			if(list != 'meta') {
				atlases[list] = {};
				console.log('LOBET MICH DENN ICH HABE EUCH KEINE META LISTE GESCHICKT');
				console.log('LOBPREISET DIESE LISTE :'+list);
				var p = './public/'+atlasFile[list].path;
				var f = require(p);
				for(var i = 0; i < f.frames.length; i++) {
						atlases[list][f.frames[i].filename] = f.frames[i].frame;
				}

				numLoaded++;
			} else {
				console.log('FÜRCHTET MICH DENN ICH HABE EUCH DIE META LISTE GESCHICKT');
				console.log(numLoaded+' DIES SOLLTE DIE ZAHL SEIN WELCHE DER LÄNGE DER ATLASE ENTSPICHT!');
				if(numLoaded == atlasFile['meta'].num_files) {
					for(var key in atlases) {
						console.log('LOBPREISET MICH FÜR DIE ÜBERGABE DIESER LISTE:'+key);
					}
					socket.emit('sendAtlas', atlases);
				}
			}
		}
	});

	socket.on('disconnect', function() {
		console.log('He\'s gone');
	});
});


