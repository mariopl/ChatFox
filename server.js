
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
  
  server = 'http://192.168.1.103:8443'

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
        prueba2();

        if (recent_messages.length > 8) {
        recent_messages = recent_messages.slice(recent_messages.length-8, recent_messages.length);
      }
      recent_messages.push({nick: socket.nickname, msg: msg});
      

      this.log.debug('MESSAGE SENT FROM ' + socket.nickname);
        socket.broadcast.emit('user message', socket.nickname, msg);
        //desde aquí despertamos a a través de los endpoints
        for (var i = 0; i < endpoints.length ; i++) {
              
          request.put({
            url:     endpoints[i],
            body:    "version=" + new Date().getTime()
          }, function (error, response, body) {
              if (!error && response.statusCode == 200) {
                console.log(body)
              }
              });

          this.log.debug('Waking up ' + endpoints[i]);

        }
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


      socket.on('nickname', function (nick, fn) {
        prueba1(nick, socket.endpoint);
        
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

        socket.on('logout', function(nickvalue) {

          delete nicknames[nickvalue];
          //socket.broadcast.emit('announcement', socket.nickname + ' disconnected');
          socket.broadcast.emit('nicknames', nicknames);
          prueba3(nickvalue);

        })
      });
  });




 dbs.collection('usuarios', function(err,collection){
doc = {"nick": 'paquito'};
collection.insert(doc, function(){});
console.log(doc)
});

function prueba1(nickdata, endpoint) {
  console.log('llamada a la funcion prueba1 que registra');

      dbs.collection('usuarios', function(err,collection){
      doc = {"nick": nickdata, "endpoint": endpoint};
      collection.insert(doc, function(){});
      console.log(doc)
      });
}

 function prueba2() {
  
  dbs.collection('usuarios', function(err,collection){
      doc = {"nick": 'pc'};
      collection.find(doc, function(){});
    });
 }

 function prueba3(nickvalue) {
  
  dbs.collection('usuarios', function(err,collection){
      doc = {"nick": nickvalue};
      collection.remove(doc, function(){});
      console.log('ELIMINADO ' + doc)
      });
 }
});