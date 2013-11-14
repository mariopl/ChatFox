  $(function() {
  navigator.mozApps.getSelf().onsuccess = function(e) {
    isInstalled = e.target.result != null;
    if (isInstalled) {

    } else {
      navigator.mozApps
        .install('http://localhost:8443/manifest.webapp');
    }
  }
  });
  
  Push();
  
  $(function () {

   if (!localStorage.messagesReceived) {

    localStorage.messagesReceived = 0;

   }

   if (!localStorage.notificationsReceived) {

    localStorage.notificationsReceived = 0;

   }

  });

  // socket.io code
  //

  var socket = io.connect('http://localhost:8443');


  socket.on('connect', function () {
    $('#chat').addClass('connected');
    socket.emit('ping');
  });

  socket.on('pong', function () {

    setTimeout('ping()', 300000);
  });

  socket.on('pongTweet', function (count, tweet) {
    tweets('@'+count, tweet);
    setTimeout('ping()', 300000);
  });

  socket.on('origin', function(count, tweet) {
    tweets('@'+count, tweet);
    setTimeout('ping()', 300000);
  });

  function ping() {
    socket.emit('ping');
  }

   socket.on('announcement', function (nick, msg) {
    $('#lines').append($('<p>').append($('<b>').text(nick), msg));
  }); 

  socket.on('nicknames', function (nicknames) {
    $('#nicknames').empty().append($('<span>Connected: </span>'));
    $('#nicknamesView').empty();
    for (var i in nicknames) {
      $('#nicknames').append($('<b>').text(nicknames[i]));
      $('#nicknamesView').append($('<li>').append($('<p>').text(nicknames[i])));
    }
  });

  socket.on('user message', message, function() {
  });

  socket.on('reconnect', function () {
    //$('#lines').remove();
    //message('ChatFox', 'Reconectado al servidor');
      location.reload(true);
    
  });

  socket.on('reconnecting', function () {
    //message('ChatFox', 'Intentando conectarse al servidor');
      location.reload(true);
    $('#send-message').css('visibility', 'hidden');
  });

  socket.on('error', function (e) {
    //message('ChatFox', e ? e : 'Algo falla, prueba a reiniciar la app');
      alert('You need an internet connection');
      location.reload(true); 
  });

  socket.on('button enabled', function() {
    $('#send-message').css('visibility', 'visible');
  })

  function message (from, msg) {
    $('#lines').append($('<p>').append($('<b>').text(from), msg));
    if (localStorage.messagesReceived) {
      localStorage.messagesReceived++;
    }
  }

  function tweets (count, tweet) {
    $('#lines').append($('<p>').append($('<b>').text(count), tweet));
    if (localStorage.messagesReceived) {
      localStorage.messagesReceived++;
    }
  }

  //
  // dom manipulation code
  //
  $(function () {
    
    var nick = localStorage.nick || null;
    $('#set-nickname').css('visibility', 'hidden');

    if(!nick) {
      $('#set-nickname').css('visibility', 'visible');
      $('#set-nickname').submit(function (ev) {
        if(($('#nick').val() == "") || ($('#nick').val() == " ") || ($('#nick').val() == "  ") || ($('#nick').val() == "   ")
          || ($('#nick').val() == "    ") || ($('#nick').val() == "     ") || ($('#nick').val() == "me") || ($('#nick').val() == "null") || ($('#nick').val() == "Null")|| ($('#nick').val() == "ChatFox")) {
          alert('Please, write your nickname');
          clearNickname();
          $('#set-nickname').css('visibility', 'visible');
          return;

        }
        socket.emit('nickname', $('#nick').val(), function (set) {
          var nick = localStorage.nick = $('#nick').val();
          $('#set-nickname').css('visibility', 'hidden');
  
          if (!set) {
            clear();
            return $('#chat').addClass('nickname-set');
          }
          $('#nickname-err').css('visibility', 'visible');
        });
        return false;
      });
      } else {


      var nick = localStorage.nick;

      socket.emit('nicknamerecovery', nick, function (set) {
           if (!set) {
            clear();
            return $('#chat').addClass('nickname-set');
          }
          $('#nickname-err').css('visibility', 'visible');
        });
      
        return false;
      
    }}); 
      

      $('#send-message').submit(function () {
            var endpoint = localStorage.endpoint || null;
            if(($('#message').val() == "") ||($('#message').val() == " ") || ($('#message').val() == "  ") || ($('#message').val() == "   ") ) {
            clear(); 
            return;
            }
            if(!($('#message').val() == "endpoint")) {
            message('me', $('#message').val());
            socket.emit('user message', $('#message').val());
            localStorage.messagesReceived--
            clear();
            $('#lines').get(0).scrollTop = 10000000;
            $('#message').blur();
            return false;

          } else {
            alert('Tu endpoint es: ' + endpoint);
            clear();
            $('#lines').get(0).scrollTop = 10000000;
            return false;
          } 
          });

        function clear () {
            $('#message').val('').focus();
          };

        function clearNickname () {
            $('#nick').val('').focus();
          };

  document.querySelector('#btn-users').addEventListener ('click', function () {
    document.querySelector('#users').className = 'current';
    document.querySelector('[data-position="current"]').className = 'left';
  });
  document.querySelector('#btn-users-back').addEventListener ('click', function () {
    document.querySelector('#users').className = 'right';
    document.querySelector('[data-position="current"]').className = 'current';

  });
  
  document.querySelector('#btn-logout').addEventListener ('click', function () {
    
    var nickvalue = localStorage.nick;
    socket.emit('logout', nickvalue);
    localStorage.clear();
    clear();
    login();
  });

  document.querySelector('#btn-statistics').addEventListener ('click', function () {
 
    alert('Messages received: ' +  localStorage.messagesReceived + '\n\nNotifications received: ' + localStorage.notificationsReceived);

  });

  function login () {
    var nick = null;

    $('#set-nickname').css('visibility', 'visible');
      $('#set-nickname').submit(function (ev) {
        if(($('#nick').val() == "") || ($('#nick').val() == " ") || ($('#nick').val() == "  ") || ($('#nick').val() == "   ")
          || ($('#nick').val() == "    ") || ($('#nick').val() == "     ") || ($('#nick').val() == "me") || ($('#nick').val() == "null") || ($('#nick').val() == "Null")|| ($('#nick').val() == "ChatFox")) {
          alert('Please, write your nickname');
          clearNickname();
          $('#set-nickname').css('visibility', 'visible');
          return;

        }
        for (var i = 1; i < 1; i++) {
            
          socket.emit('nickname', $('#nick').val(), function (set) {
          var nick = localStorage.nick = $('#nick').val();
          $('#set-nickname').css('visibility', 'hidden');
  
          if (!set) {
            clear();
            return $('#chat').addClass('nickname-set');
          }
          $('#nickname-err').css('visibility', 'visible');
        });
        return false;
      }
      });  
    }
