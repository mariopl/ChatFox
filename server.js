
  var fs = require('fs'),
    path = require('path'),
    sio = require('socket.io'),
    static = require('node-static');
    db = require('./js/db.js');
    push = require('./js/push.js');
    request = require('request');
    MongoClient = require('mongodb').MongoClient;

  MongoClient.connect('mongodb://127.0.0.1:27017/chatfox', function(err, dbs) {
if (err) throw err;
console.log("Connected to Database");

  var app = require('http').createServer(handler);
  app.listen(8443);

  var file = new static.Server(path.join(__dirname,'/'));

  function handler(req, res) {
    file.serve(req, res);
  }

  var io = sio.listen(app),
    nicknames = {},
    endpoints = [],
    recent_messages = [];

  io.sockets.on('connection', function (socket) {

      if (recent_messages.length > 0) {
      
      for (i in recent_messages) {
        socket.emit('announcement', recent_messages[i].nick, recent_messages[i].msg);
      }
    }


      socket.on('user message', function (msg) {
        wakeUp(socket.endpoint, msg);

        if (recent_messages.length > 8) {
        recent_messages = recent_messages.slice(recent_messages.length-8, recent_messages.length);
      }
      recent_messages.push({nick: socket.nickname, msg: msg});
      

      this.log.debug('MESSAGE SENT FROM ' + socket.nickname);
        socket.broadcast.emit('user message', socket.nickname, msg);
      });

        socket.on('user endpoint', function(endpoint){
        //endpoints[endpoint] = socket.endpoint = endpoint;
        socket.endpoint = endpoint;
        endpoints.push(endpoint);
        this.log.debug(endpoints);
        this.log.debug(endpoints.length);
        function eliminateDuplicates(endpoints) {

          this.log.debug('eliminateDuplicates');
        }
      
        
        });

      socket.on('nicknamerecovery', function(nick) {

        nicknames[nick] = socket.nickname = nick;
        io.sockets.emit('nicknames', nicknames);

      });

      socket.on('logout', function(nickvalue) {

          delete nicknames[nickvalue];
          //socket.broadcast.emit('announcement', socket.nickname + ' disconnected');
          socket.broadcast.emit('nicknames', nicknames);
          exit(nickvalue);

      });


      socket.on('nickname', function (nick, fn) {
        save(nick, socket.endpoint);
        
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


function save(nickdata, endpoint) {

      dbs.collection('usuarios', function(err,collection){
      doc = {"nick": nickdata, "endpoint": endpoint};
      collection.insert(doc, function(){});
      console.log(doc)
      });
}

 function wakeUp(myEndpoint, msg) {

  socket.broadcast.emit('info', socket.nickname, msg);
  var collection = dbs.collection('usuarios')
    .find({},{endpoint:1, _id:0})
    .limit(10)
    .toArray(function(err, docs) {
      var array = docs;
      for (var i = 0; i < docs.length ; i++) {
        if(docs[i].endpoint == socket.endpoint){
        } else {
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

 function exit(nickvalue) {
  
  dbs.collection('usuarios', function(err,collection){
      doc = {"nick": nickvalue};
      collection.remove(doc, function(){});
      });
 }
});
});
