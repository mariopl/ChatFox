
  var fs = require('fs'),
    path = require('path'),
    sio = require('socket.io'),
    static = require('node-static');
    db = require('./js/db.js');
    push = require('./js/push.js');

  var app = require('http').createServer(handler);
  app.listen(8443);

  var file = new static.Server(path.join(__dirname,'/'));
  
  server = 'http://localhost:8443'

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
      socket.emit('announcement', recent_messages[i].nick + ': ' + recent_messages[i].msg);
    }
    }


    socket.on('user message', function (msg) {

      if (recent_messages.length > 5) {
      recent_messages = recent_messages.slice(recent_messages.length-5, recent_messages.length);
    }
    recent_messages.push({nick: socket.nickname, msg: msg});

    this.log.debug('MESSAGE SENT FROM ' + socket.nickname);
      socket.broadcast.emit('user message', socket.nickname, msg);
    });


    socket.on('user endpoint', function(endpoint){
      endpoints[endpoint] = socket.endpoint = endpoint;
    });


    socket.on('nickname', function (nick, fn) {
      
      var new_user = new db.User({nick: nick, endpoint: socket.endpoint});

      new_user.save(function(err) {

        if (err) {

          fn(true);
        
        } else {

          fn(false);
          nicknames[nick] = socket.nickname = nick;
          socket.broadcast.emit('announcement', nick + ' connected');
        io.sockets.emit('nicknames', nicknames);
        }
      
    });

    socket.on('disconnect', function (nick) {

      if (!socket.nickname) {
         db.User.findOneAndRemove(
        {nick : nick}
      );
      } return;

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

    socket.broadcast.emit('announcement', socket.nickname + ' disconnected');
    socket.broadcast.emit('nicknames', nicknames);
    });
    });
  });

  //5.Send a notification from your server
  function processNotification(endpoint) {

      var notification = window.navigator.mozNotification.createNotification("ChatFox", "You have new messages");
      
        notification.show();
  } 
  



