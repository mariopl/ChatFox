/*
Class that will allow us to register for push 
and register in push server
*/
var Push = (function() {	

//Now we call push.register() to request an endpoint
    var endpoint = localStorage.endpoint || null;
    var socket = io.connect('http://localhost:8443');

  if (navigator.push) {    
    window.navigator.mozSetMessageHandler('push', function() {
      
      var from = localStorage.from;
      var msg = localStorage.msg;

      console.log('-----------------CHATFOX NOTIFICATION---------------- EMISOR: ' + from + ' MENSAJE: ' + msg)

      if (!localStorage.notificationsReceived) {
        localStorage.notificationsReceived = 1;
      } else if (localStorage.notificationsReceived) {
        localStorage.notificationsReceived++;
      }
      
      var notification = navigator.mozNotification.createNotification(from, msg);
    
      notification.show();
    });

    window.navigator.mozSetMessageHandler('push-register', function() {

      navigator.push.unregister(endpoint);

      var req = navigator.push.register();

      req.onsuccess = function(e) {
        var endpoint = localStorage.endpoint = req.result;
        var socket = io.connect('http://localhost:8443');
        socket.emit('user endpoint', endpoint);
      }

      req.onerror = function(e) {
       alert("Error getting a new endpoint: " + JSON.stringify(e));
     }
    });
  }

  if(!endpoint){
    if (navigator.push) {
    	var req = navigator.push.register();
    	
    	req.onsuccess = function(e) {
       var endpoint = localStorage.endpoint = req.result;
       socket.emit('user endpoint', endpoint); 
       console.log('---------CHATFOX-------- Endpoint successfully registered: ' + endpoint);
     }

     req.onerror = function(e) {
       alert("Error getting a new endpoint: " + JSON.stringify(e));
       console.log('---------CHATFOX-------- Error getting the endpoint');
     }
   } 
  } else {
    var endpoint = localStorage.endpoint;
    socket.emit('user endpoint', endpoint); 
  }
})();
