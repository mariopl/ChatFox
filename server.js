
  var fs = require('fs'),
    path = require('path'),
    sio = require('socket.io'),
    static = require('node-static'),
    db = require('./js/db.js'),
    request = require('request'),
    MongoClient = require('mongodb').MongoClient

var Stream = require('user-stream');
var stream = new Stream({
    consumer_key: 'PwyqI38WcK6AwlwOY6qzbw',
    consumer_secret: 'F524X1qT4Pu6uyKtGSiN3TyOs6cMA9R36ajXGrQdis',
    access_token_key: '2182024027-3IPrwww5sT9sDuyMO1yErBEKyRC0XgghCSL3Wu9',
    access_token_secret: 'OLva8koa0Og6XV5HNzPEmDXqhNOds4QaaHL5oWLb6quUw'
});


  MongoClient.connect('mongodb://127.0.0.1:27017/chatfox', function(err, dbs) {
if (err) throw err;
console.log("Connected to Database");

stream.stream();

  stream.on('data', function(json) {
    tweet = json.text;
      if (tweet != undefined){
        ultimoMensaje = actualTweet = tweet;
        updateTweet = tweet;
        count = (json.user && json.user.screen_name) || 'Message from Twitter';
        ultimoEmisor = '@'+count;
        recent_messages.push({nick: '@'+count, msg: actualTweet});
        console.log(count);
        console.log(ultimoMensaje);
        var collection = dbs.collection('usuarios')
       .find({} , {endpoint:1, _id:0}) // .find({ off: true })
       .toArray(function(err, docs) {
        var array = docs;
        console.log(array.length)
        for (var i = 0; i < docs.length ; i++) {
          console.log('Despertando  ' + docs[i].endpoint)
          request.put({
            url:     docs[i].endpoint,
            body:    "version=" + new Date().getTime()
          }, function (error, response, body) {
              if (!error && response.statusCode == 200) {
                console.log(body)
              }
              });
        }
    });
      // console.log('ultimo emisor: ' + ultimoEmisor)
      // console.log('ultimo mensaje: ' + ultimoMensaje)

      }
  });



  var app = require('http').createServer(handler);
  app.listen(8443);

  var file = new static.Server(path.join(__dirname,'/'));

  function handler(req, res) {
    file.serve(req, res);
  }

  var io = sio.listen(app),
    nicknames = {},
    endpoints = [],
    tweet = null,
    count = null,
    actualTweet = null,
    updateTweet = null,
    recent_messages = [],
    ultimoMensaje = null,
    ultimoEmisor = null,

    i = -1;


  io.sockets.on('connection', function (socket) {

    console.log('inicio')

    if (recent_messages.length > 0) {
      
      for (i in recent_messages) {
        socket.emit('announcement', recent_messages[i].nick, recent_messages[i].msg);
      }
    }

      socket.on('user message', function (msg) {
      updateTime(socket.nickname);
      remove();
        wakeUp(socket.endpoint, msg, socket.nickname);
        ultimoEmisor = socket.nickname;
        ultimoMensaje = msg;
        console.log(socket.nickname);

        online();
    

        if (recent_messages.length > 8) {
        recent_messages = recent_messages.slice(recent_messages.length-8, recent_messages.length);
        }
        recent_messages.push({nick: socket.nickname, msg: msg});
        socket.broadcast.emit('user message', socket.nickname, msg);
        console.log('ultimo emisor: ' + ultimoEmisor)
        console.log('ultimo mensaje: ' + ultimoMensaje)
      });

        socket.on('user endpoint', function(endpoint){
        socket.endpoint = endpoint;
        });

        socket.on('new endpoint', function(endpoint){
          console.log('ENDPOINT RECIBIDO');
          update(endpoint)
        });

      socket.on('hello', function() {
        console.log('enviando pong' + ultimoMensaje)
        socket.emit('pong', ultimoEmisor, ultimoMensaje);
        online();
      });

      socket.on('nicknamerecovery', function(nick) {

        nicknames[nick] = socket.nickname = nick;
        //io.sockets.emit('nicknames', nicknames);
        online();

      });

      socket.on('logout', function(nickvalue) {

          delete nicknames[nickvalue];
          //socket.broadcast.emit('announcement', socket.nickname + ' disconnected');
          //socket.broadcast.emit('nicknames', nicknames);
          exit(nickvalue);
          online();

      });


      socket.on('nickname', function (nick, fn) {
        save(nick, socket.endpoint, socket.id);
        
          var new_user = new db.User({nick: nick, endpoint: socket.endpoint});

          new_user.save(function(err) {

            if (err) {

              fn(true);
            
            } else {

              fn(false);
              nicknames[nick] = socket.nickname = nick;
              //socket.broadcast.emit('announcement', nick + ' connected');
            io.sockets.emit('nicknames', nicknames);
            }
            socket.emit('button enabled');
          
        });

        socket.on('disconnect', function () {

          if (!socket.nickname) return;

        // TODO: mark as disconnected in DB
        
        delete nicknames[socket.nickname];

        var conditions = { nick: socket.nickname }
          , update = { connected: false, last_connected: new Date() }
          , options = { multi: false }
          , callback = null;

        db.User.update(conditions, update, options, function(err) {
          
          if (err) {
            console.warn('Updating disconnected user record failed');
          }
        });

        //socket.broadcast.emit('announcement', socket.nickname + ' disconnected');
        socket.broadcast.emit('nicknames', nicknames);
        });

      });
  //});

function sendTweet(count, tweet) {
  socket.broadcast.emit('pongTweet', count, tweet);
  //socket.broadcast.emit('nicknames', nicknames);
  online();
}


function save(nickdata, endpoint) {

      dbs.collection('usuarios', function(err,collection){
      doc = {"nick": nickdata, "endpoint": endpoint, time: new Date().getTime()};
      collection.insert(doc, function(){});
      console.log(doc)
      });
}

function update(endpoint) {

      
    dbs.collection('usuarios').update({nick: socket.nickname}, {$set: {endpoint: endpoint}}, {w:1}, function(err) {
      if (err) console.warn(err.message);
      else console.log('successfully updated');
    });
}

function updateTime(user) {
  dbs.collection('usuarios').update({nick: user}, {$set: {time: new Date().getTime()}}, {w:1}, function(err) {
      if (err) console.warn(err.message);
      else console.log('successfully updated');
    });
}

 function wakeUp(myEndpoint, msg, issuing) {

  var collection = dbs.collection('usuarios')
    .find({} , {endpoint:1, _id:0}) // .find({ off: true })
    .toArray(function(err, docs) {
      var array = docs;
      console.log(array.length)
      for (var i = 0; i < docs.length ; i++) {
        if(docs[i].endpoint == socket.endpoint){
        } else {
          console.log('Despertando  ' + docs[i].endpoint)
          request.put({
            url:     docs[i].endpoint,
            body:    "version=" + new Date().getTime()
          }, function (error, response, body) {
              if (!error && response.statusCode == 200) {
                console.log(body)
              }
              });
          }
        }
    });

  }

function remove(){

  var collection = dbs.collection('usuarios')
    .find({} , {time:1, _id:0}) // .find({ off: true })
    .toArray(function(err, docs) {
      var array = docs;
      console.log(array.length)
      for (var i = 0; i < docs.length ; i++) {
        if(new Date().getTime() - docs[i].time < 43200000) {
          console.log('está activo');
        }else {
          dbs.collection('usuarios', function(err,collection){
          doc = {"time": docs[i].time};
          collection.remove(doc, function(){});
          });
        }
        
      }
    });
  }


 function exit(nickvalue) {
  
  dbs.collection('usuarios', function(err,collection){
      doc = {"nick": nickvalue};
      collection.remove(doc, function(){});
      });
 }

 function online() {

  var online = [];
        for (var i = io.sockets.clients().length - 1; i >= 0; i--) {
          if( io.sockets.clients()[i].nickname != null ){
          online[i] = io.sockets.clients()[i].nickname;
        }
        };

        console.log(online);
        socket.emit('nicknames', online);
        socket.broadcast.emit('nicknames', online);


 }

});
});
