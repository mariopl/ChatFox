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
  var endpoint = localStorage.endpoint;
  var endpointButton = null;

  $(function init() {

    endpointButton = document.getElementById("endpoint");
    endpointButton.addEventListener('click',endpointClick);

  });

  function endpointClick(){
    alert('Tu endpoint es: ' + endpoint);
  }

  var socket = io.connect('http://localhost:8443');

  socket.on('connect', function () {
    $('#chat').addClass('connected');
  });

  socket.on('announcement', function (msg) {
    $('#lines').append($('<p>').append($('<em>').text(msg)));
  });

  socket.on('nicknames', function (nicknames) {
    $('#nicknames').empty().append($('<span>Conectados: </span>'));
    for (var i in nicknames) {
      $('#nicknames').append($('<b>').text(nicknames[i]));
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
    $('#lines').append($('<p>').append($('<b>').text(from), msg));
  }

  //
  // dom manipulation code
  //
  $(function () {
    $('#set-nickname').submit(function (ev) {
      socket.emit('nickname', $('#nick').val(), function (set) {
        nick.localStorage = $('#nick').val();
        if (!set) {
          clear();
          return $('#chat').addClass('nickname-set');
        }
        $('#nickname-err').css('visibility', 'visible');
      });
      return false;
    });

    $('#send-message').submit(function () {
      message('me', $('#message').val());
      socket.emit('user message', $('#message').val());
      clear();
      $('#lines').get(0).scrollTop = 10000000;
      return false;
    });

    function clear () {
      $('#message').val('').focus();
    };

  });