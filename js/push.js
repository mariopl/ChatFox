/*
Class that will allow us to register for push 
and register in push server
*/
var Push = (function() {	
  //Now we call push.register() to request an endpoint
  var endpoint = localStorage.endpoint || null;

  if(!endpoint){
    if (navigator.push) {
    	var req = navigator.push.register();
    	
    	req.onsuccess = function(e) {
    	  var endpoint = localStorage.endpoint = req.result;
        var socket = io.connect('http://localhost:8443');
        socket.emit('user endpoint', endpoint); 
    	}
    	
    	req.onerror = function(e) {
         alert("Error getting a new endpoint: " + JSON.stringify(e));
      }
    } 
  } else {

    var endpoint = localStorage.endpoint;
    var socket = io.connect('http://localhost:8443');
        socket.emit('user endpoint', endpoint); 
  }

  //Listen to push notifications
  if (navigator.push) {

    socket.on('info', function(socketnickname, msg) {
    
    window.navigator.mozSetMessageHandler('push', function() {
    
      var notification = navigator.mozNotification.createNotification(socketnickname, msg);
    
      notification.show();

      if (!localStorage.notificationsReceived) {


      localStorage.notificationsReceived = 1;

    } else if (localStorage.notificationsReceived) {

      localStorage.notificationsReceived++;
    }
    });
    });
  }

});
