var fs = require('fs'),
path = require('path'),
sio = require('socket.io'),
static = require('node-static'),
request = require('request'),
Stream = require('user-stream'),
MongoClient = require('mongodb').MongoClient

MongoClient.connect('mongodb://127.0.0.1:27017/cf', function(err, db) {
	if (err) throw err;

	var app = require('http').createServer(handler);
	app.listen(8443);

	var file = new static.Server(path.join(__dirname,'/'));

	function handler(req, res) {
		file.serve(req, res);
	}

	var io = sio.listen(app),
	recent_messages = [],
	endpoints = [],
	tweets = [],
	nicknames = {};
	stream = new Stream({
	  consumer_key: 'PwyqI38WcK6AwlwOY6qzbw',
	  consumer_secret: 'F524X1qT4Pu6uyKtGSiN3TyOs6cMA9R36ajXGrQdis',
	  access_token_key: '2182024027-3IPrwww5sT9sDuyMO1yErBEKyRC0XgghCSL3Wu9',
	  access_token_secret: 'OLva8koa0Og6XV5HNzPEmDXqhNOds4QaaHL5oWLb6quUw'
	});

	stream.stream();

	stream.on('data', function(json) {
		tweet = json.text;
		if (tweet != undefined){
			count = (json.user && json.user.screen_name) || 'Message from Twitter';
			ultimoEmisor = '@'+count;
			recent_messages.push({nick: '@'+count, msg: tweet});
			if (tweets.length > 8) {
				tweets = tweets.slice(tweets.length-8, tweets.length);
			}
			tweets.push({nick: '@'+count, msg: tweet});
			var collection = db.collection('usuarios')
			.find({} , {endpoint:1, _id:0})
			.toArray(function(err, docs) {
				var array = docs;
				for (var i = 0; i < docs.length ; i++) {
						request.put({
						url:     docs[i].endpoint,
						body:    "version=" + new Date().getTime()
					}, function (error, response, body) {
						if(response && response.statusCode == 200){
							console.log(body);
							console.log('NOTIFICACION ENVIADA: EMISOR: ' + '@' + count + ' MENSAJE: ' + tweet);
						} else {
							console.log(error);
							console.log(body);
						}
					});
				}
			});


		}
	
	});


	io.sockets.on('connection', function (socket) {
		online();

		if (recent_messages.length > 0) {

			for (i in recent_messages) {
				socket.emit('announcement', recent_messages[i].nick, recent_messages[i].msg);
			}
		}

		socket.on('user message', function (msg) {
			socket.broadcast.emit('user message', socket.nickname, msg);
			recent_messages.push({nick: socket.nickname, msg: msg});
			wakeUp(socket.endpoint, msg, socket.nickname);
			updateTime(socket.nickname);
			remove();
			if (recent_messages.length > 8) {
				recent_messages = recent_messages.slice(recent_messages.length-8, recent_messages.length);
			}
		});

		socket.on('last message', function() {
			socket.emit('lmessage', recent_messages[recent_messages.length - 1].nick, recent_messages[recent_messages.length - 1].msg);
			socket.emit('pong', tweets);
		})

		socket.on('nickname', function (nick, fn) {
			save(nick, socket.endpoint, socket.id);
			if (nicknames[nick]) {
				fn(true);
			}
			else {

				fn(false);
				nicknames[nick] = socket.nickname = nick;
				//socket.broadcast.emit('announcement', nick + ' connected');
				io.sockets.emit('nicknames', nicknames);
			}
		});

		socket.on('disconnect', function () {
			if (!socket.nickname) {
				return;
			}
			delete nicknames[socket.nickname];
			//socket.broadcast.emit('announcement', socket.nickname + ' disconnected');
			socket.broadcast.emit('nicknames', nicknames);
		});

		socket.on('nicknamerecovery', function(nick) {

			nicknames[nick] = socket.nickname = nick;
			online();
		});

		socket.on('logout', function(nickvalue) {

			delete nicknames[nickvalue];

			exit(nickvalue);
			online();

		});

		socket.on('user endpoint', function(endpoint){
			socket.endpoint = endpoint;
		});

		socket.on('user autoendpoint', function(autoendpoint){
			socket.autoendpoint = autoendpoint;
		});

		socket.on('new endpoint', function(endpoint){
      		update(endpoint)
    	});

		socket.on('ping', function() {
			if(socket.autoendpoint == null){}
				else{ 
					request.put({
						url: socket.autoendpoint,
						body: "version=" + new Date().getTime()
					}, function (error, response, body) {
						if(response && response.statusCode == 200){
							console.log(body);
							console.log('NOTIFICACION PING ENVIADA: EMISOR: ' + socket.nickname);
						} else {
							console.log(error);
							console.log(body);
						}
					})

				}
			});

		function online() {
			var online = [];
			for (var i = io.sockets.clients().length - 1; i >= 0; i--) {
				if( io.sockets.clients()[i].nickname != null ){
					online[i] = io.sockets.clients()[i].nickname;
				}
			};

			socket.emit('nicknames', online);
			socket.broadcast.emit('nicknames', online);
		}

		function save(nickdata, endpoint) {

			db.collection('usuarios', function(err,collection){
				doc = {"nick": nickdata, "endpoint": endpoint, time: new Date().getTime()};
				collection.insert(doc, function(){});
				});
		}

		function exit(nickvalue) {

			db.collection('usuarios', function(err,collection){
				doc = {"nick": nickvalue};
				collection.remove(doc, function(){});
			});
		}

		function wakeUp(myEndpoint, msg, issuing) {

			var collection = db.collection('usuarios')
            .find({} , {endpoint:1, _id:0})
            .toArray(function(err, docs) {
            	var array = docs;
            	for (var i = 0; i < docs.length ; i++) {
            		if(docs[i].endpoint == socket.endpoint || docs[i].endpoint == null){
            		} else {
            			request.put({
            				url: docs[i].endpoint,
            				body: "version=" + new Date().getTime()
            			}, function (error, response, body) {
            				if(response && response.statusCode == 200){
            					console.log(body);
            					console.log('NOTIFICACION ENVIADA: EMISOR: ' + issuing + ' MENSAJE: ' + msg);
            				} else {
            					console.log(error);
            					console.log(body);
            				}
            			})

            		}
            	}
            });

        }

        function remove(){

        	var collection = db.collection('usuarios')
    		.find({} , {time:1, _id:0}) // .find({ off: true })
    		.toArray(function(err, docs) {
    			var array = docs;
    			for (var i = 0; i < docs.length ; i++) {
    				if(new Date().getTime() - docs[i].time < 43200000) {
    				}
    				else {
    					dbs.collection('usuarios', function(err,collection){
    					doc = {"time": docs[i].time};
    					collection.remove(doc, function(){});
    					});
    				}

    			}
    		});
		}

		function updateTime(user) {
			db.collection('usuarios').update({nick: user}, {$set: {time: new Date().getTime()}}, {w:1}, function(err) {
				if (err) console.warn(err.message);
			});
		}

		function update(endpoint) {
			db.collection('usuarios').update({nick: socket.nickname}, {$set: {endpoint: endpoint}}, {w:1}, function(err) {
				if (err) console.warn(err.message);
			});
		}
    });
});