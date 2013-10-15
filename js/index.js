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

  var Notifications = function notify() {

  var notify = navigator.mozNotification.createNotification("ChatFox",
       "You have a new message");
              notification.show();
  };
  
  Push();

  //
  // socket.io code
  //

  var socket = io.connect('http://localhost:8443');

  socket.on('connect', function () {
    $('#chat').addClass('connected');
  });

  socket.on('announcement', function (msg) {
    $('#lines').append($('<li>').append($('<p>').text(msg)));
  });

  socket.on('nicknames', function (nicknames) {
    $('#nicknames').empty().append($('<span>Connected: </span>'));
    $('#nicknamesView').empty();
    for (var i in nicknames) {
      $('#nicknames').append($('<b>').text(nicknames[i]));
      $('#nicknamesView').append($('<li>').append($('<p>').text(nicknames[i])));
    }
  });

  socket.on('user message', message);
  socket.on('reconnect', function () {
    $('#lines').remove();
    message('ChatFox', 'Reconectado al servidor');
  });

  socket.on('reconnecting', function () {
    message('ChatFox', 'Intentando conectarse al servidor');
  });

  socket.on('error', function (e) {
    message('ChatFox', e ? e : 'Algo está fallando');
  });

  function message (from, msg) {
    $('#lines').append($('<li>').append($('<p>').text(from + ': ' + msg)));
  }

  //
  // dom manipulation code
  //
  $(function () {
    $('#set-nickname').submit(function (ev) {
      if($('#nick').val() == "") {
        alert('Please, enter your nickname');
        return;
      }
      socket.emit('nickname', $('#nick').val(), function (set) {
        nick.localStorage = $('#nick').val();
        $('#set-nickname').css('visibility', 'hidden');
        if (!set) {
          clear();
          return $('#chat').addClass('nickname-set');
        }
        $('#nickname-err').css('visibility', 'visible');
      });
      return false;
    });

      $('#send-message').submit(function () {
            var endpoint = localStorage.endpoint || null;
            message('me', $('#message').val());
            if(!($('#message').val() == "endpoint")) {
            socket.emit('user message', $('#message').val());
            clear();
            $('#lines').get(0).scrollTop = 10000000;
            return false;
          } else {
            alert('Tu endpoint es: ' + endpoint);
          }
          });
          function clear () {
            $('#message').val('').focus();
          };

  document.querySelector('#btn-users').addEventListener ('click', function () {
    document.querySelector('#users').className = 'current';
    document.querySelector('[data-position="current"]').className = 'left';
  });
  document.querySelector('#btn-users-back').addEventListener ('click', function () {
    document.querySelector('#users').className = 'right';
    document.querySelector('[data-position="current"]').className = 'current';

  });

  });