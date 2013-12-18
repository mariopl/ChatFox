$(function() {
	navigator.mozApps.getSelf().onsuccess = function(e) {
		isInstalled = e.target.result != null;
		if (isInstalled) {

		} else {
			navigator.mozApps
			.install('http://chatfox.es/manifest.webapp');
		}
	}
});


$(function () {
	if (!localStorage.messagesReceived) {
		localStorage.messagesReceived = 0;
	}

	if(new Date().getTime() - activity > 86400000 && activity != 'new') {
      localStorage.nick = '';
      $('#set-nickname').css('visibility', 'visible');
      alert('Your session has been closed')
      activity = 'new'; 
    }

    if(!navigator.onLine) {
		location.reload(true);
	}
});

var socket = io.connect('http://chatfox.es');
var nick = localStorage.nick || null;
var ultimoEmisorRecibido = localStorage.ultimoEmisor;
var ultimoMensajeRecibido = localStorage.ultimoMensaje;
var lastMsg = localStorage.lastMsg;
var activity = localStorage.activity = new Date().getTime();
var atweet = localStorage.atweet;
var endpoint = localStorage.endpoint;


socket.on('connect', function () {
	$('#chat').addClass('connected');
});

login();


function login() {	

	if(!nick) {
		$('#set-nickname').submit(function (ev) {
			if(($('#nick').val().contains(" ")) || ($('#nick').val().contains("<")) || ($('#nick').val() == " ") || 
				($('#nick').val() == "me") || ($('#nick').val() == "null") || ($('#nick').val() == "Null")||
				 ($('#nick').val() == "ChatFox")) {
				alert('Please, write your nickname');
			clearNickname();
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
		$('#set-nickname').css('visibility', 'hidden');
		socket.emit('nicknamerecovery', nick, function (set) {
			if (!set) {
				clear();
				return $('#chat').addClass('nickname-set');
			}
			$('#nickname-err').css('visibility', 'visible');
		});
		return false;

	}
};

$('#send-message').submit(function () {
	var endpoint = localStorage.endpoint || null;
	if(($('#message').val().contains("  ")) || ($('#message').val() == " ")) {
		clear(); 
		return;
	}

	ultimoMensajeRecibido = localStorage.ultimoMensaje = $('#message').val();
	var msg = $('#message').val();
	socket.emit('message_to_server',{ message : $('#message').val()});
	activity = new Date().getTime();
	localStorage.messagesReceived--
	clear();
	$('#lines').get(0).scrollTop = 10000000;
	$('#message').blur();
	return false;

	
});

function clear () {
	$('#message').val('').focus();
};

function clearNickname () {
	$('#nick').val('').focus();
};

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

document.querySelector('#autoping').addEventListener ('click', function () {

	socket.emit('ping');

});

document.querySelector('#btn-statistics').addEventListener ('click', function () {

	alert('Messages received: ' +  localStorage.messagesReceived + '\n\nNotifications received: ' + localStorage.notificationsReceived);

});

document.querySelector('#endpoint').addEventListener ('click', function () {

	alert('Tu endpoint es: ' + localStorage.endpoint + '\n\n' + 'Tu autoendpoint es: ' + localStorage.autoendpoint);

});


socket.on('announcement', function (emisor, data) {
	$('#lines').append($('<p>').append($('<b>').text(emisor), data));
	$('#lines').get(0).scrollTop = 10000000;
	lastMsg = localStorage.lastMsg = data;
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


//socket.on('user message', message);
socket.on("message_to_client", function(emisor, data) {
	$('#lines').append($('<p>').append($('<b>').text(emisor), data));
        $('#lines').get(0).scrollTop = 10000000;
        if (localStorage.messagesReceived) {
                localStorage.messagesReceived++;
        } 
});

socket.on('reconnect', function () {
	$('#lines').remove();

});

socket.on('reconnecting', function () {
	location.reload(true);
});

socket.on('error', function (e) {
});

socket.on('pong', function (tweets) {
	var previous = localStorage.atweet;
    var todata = tweets[tweets.length - 1].msg.toString();
    var data = todata; 

    
    for (var i = tweets.length - 1; i >= 0; i--) {


      if(previous != tweets[i].msg && tweets[i].msg != lastMsg){
        var var1 = tweets[i].nick;
        var var2 = tweets[i].msg;
        $('#lines').append($('<p>').append($('<b>').text(var1), var2));
        lastMsg = localStorage.lastMsg = var2;
        $(function() {
            if (localStorage.messagesReceived) {
              localStorage.messagesReceived++;  
            }          
        });       
      } else {
        break;
      }
    }
    var atweet = localStorage.atweet = data;
    $('#lines').get(0).scrollTop = 10000000;
    
 
});




