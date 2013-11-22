  $(function() {
  navigator.mozApps.getSelf().onsuccess = function(e) {
    isInstalled = e.target.result != null;
    if (isInstalled) {

    } else {
      navigator.mozApps
        .install('http://192.168.1.57:8443/manifest.webapp');
    }
  }
  });

  // socket.io code
  //
    

  var socket = io.connect('http://192.168.1.57:8443');

  login();
  var ultimoEmisorRecibido = localStorage.ultimoEmisor;
  var ultimoMensajeRecibido = localStorage.ultimoMensaje;
  var atweet = localStorage.lastTweet;
  var lastMsg = null;
  var activity = localStorage.activity = new Date().getTime();


  socket.on('connect', function () {
    $('#chat').addClass('connected');
    socket.emit('hello');
  });

  socket.on('pong', function (aultimoEmisor, aultimoMensaje) {
    setTimeout('hello()', 10000);

    if(new Date().getTime() - activity > 43200000 && activity != 'new') {
      localStorage.nick = '';
      $('#set-nickname').css('visibility', 'visible');
      alert('Your session has been closed')
      activity = 'new';
      
    }

         if(aultimoMensaje != ultimoMensajeRecibido) {
        ultimoEmisorRecibido = localStorage.ultimoEmisor = aultimoEmisor;
        ultimoMensajeRecibido = localStorage.ultimoMensaje = aultimoMensaje;

        if(ultimoEmisorRecibido != null && ultimoMensajeRecibido != lastMsg){
        $('#lines').append($('<p>').append($('<b>').text(ultimoEmisorRecibido), ultimoMensajeRecibido));
        $('#lines').get(0).scrollTop = 10000000;

        
        
        if (!localStorage.messagesReceived) {
          localStorage.messagesReceived = 1;
        } else if (localStorage.messagesReceived) {
        localStorage.messagesReceived++;
        }    
        if (navigator.push){
          pushTweet(aultimoEmisor, aultimoMensaje);
          if (!localStorage.notificationsReceived) {
          localStorage.notificationsReceived = 1;
          } else if (localStorage.notificationsReceived) {
          localStorage.notificationsReceived++;
          }
          
    }
  }

    }
    
  });

  function hello() {
    socket.emit('hello');
  }


  socket.on('announcement', function (nick, msg) {
    $('#lines').append($('<p>').append($('<b>').text(nick), msg));
    $('#lines').get(0).scrollTop = 10000000;
    lastMsg = msg;
  }); 

  socket.on('nicknames', function (online) {
    $('#nicknames').empty().append($('<span>Connected: </span>'));
    $('#nicknamesView').empty();
    for (var i in online) {
      if (online[i] != undefined){
      $('#nicknames').append($('<b>').text(online[i]));
      $('#nicknamesView').append($('<li>').append($('<p>').text(online[i])));
    }

    }
  });
  

  socket.on('user message', function(nickname, msg) {
    ultimoEmisorRecibido = localStorage.ultimoEmisor = nickname;
    ultimoMensajeRecibido = localStorage.ultimoMensaje = msg;
    message(nickname,msg);
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
      location.reload(true); 
  });

  socket.on('button enabled', function() {
    $('#send-message').css('visibility', 'visible');
  })

  function message (from, msg) {
    // var d = new Date();
    // var curr_date = d.getDate();
    // var curr_month = d.getMonth() + 1;
    // var curr_year = d.getFullYear();
    // var curr_hour = d.getHours();
    // var curr_minute = d.getMinutes();

    $('#lines').append($('<p>').append($('<b>').text(from), msg));
    $('#lines').get(0).scrollTop = 10000000;

    console.log('---------CHATFOX-------- NOTIFICATION ' + 'EMISOR: ' + from + ' MENSAJE: ' + msg);
    // if (document.hidden) {
    //   var notification = navigator.mozNotification.createNotification(from, msg);
    //   notification.show();
    //   console.log('notification.show() ejecutado');
    //   localStorage.notificationsReceived++;
    // }
   
    if (!localStorage.messagesReceived) {
        localStorage.messagesReceived = 1;
      } else if (localStorage.messagesReceived) {
        localStorage.messagesReceived++;
      }    
    if (navigator.push){
      if (!localStorage.notificationsReceived) {
        localStorage.notificationsReceived = 1;
      } else if (localStorage.notificationsReceived) {
        localStorage.notificationsReceived++;
      }
      
      var notification = navigator.mozNotification.createNotification(from, msg);
    
      notification.show();
    }

  
  }

  function pushTweet(var1, var2) {

    var notification = navigator.mozNotification.createNotification(var1, var2);
    
      notification.show();

  }

  // function tweets (count, tweet) {
  //   $('#lines').append($('<p>').append($('<b>').text(count), tweet));
  //   $('#lines').get(0).scrollTop = 10000000;
  //   if (!localStorage.messagesReceived) {
  //       localStorage.messagesReceived = 1;
  //     } else if (localStorage.messagesReceived) {
  //       localStorage.messagesReceived++;
  //     }    
  //   if (navigator.push && document.hidden){
  //     if (!localStorage.notificationsReceived) {
  //       localStorage.notificationsReceived = 1;
  //     } else if (localStorage.notificationsReceived) {
  //       localStorage.notificationsReceived++;
  //     }
      
  //     var notification = navigator.mozNotification.createNotification('@'+count, tweet);
    
  //     notification.show();
  //   }
  // }



  //
  // dom manipulation code
  //
  function login() {
    
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
          activity = localStorage.activity = new Date().getTime();
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
      
    }}; 
      

      $('#send-message').submit(function () {
            var endpoint = localStorage.endpoint || null;
            if(($('#message').val() == "") ||($('#message').val() == " ") || ($('#message').val() == "  ") || ($('#message').val() == "   ") ) {
            clear(); 
            return;
            }
            if(!($('#message').val() == "endpoint")) {
            message('me', $('#message').val());
            ultimoMensajeRecibido = localStorage.ultimoMensaje = $('#message').val();
            socket.emit('user message', $('#message').val());
            activity = new Date().getTime();
            //localStorage.messagesReceived--
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
    localStorage.nick = '';
    clear();
    reinicio();
    
  });

  document.querySelector('#btn-statistics').addEventListener ('click', function () {
 
    alert('Messages received: ' +  localStorage.messagesReceived + '\n\nNotifications received: ' + localStorage.notificationsReceived);

  });

  function logout() {
    var nickvalue = localStorage.nick;
    socket.emit('logout', nickvalue);
    localStorage.nick = '';
    clear();
    reinicio();
  }


  function reinicio() {
    location.reload(true);
  }
