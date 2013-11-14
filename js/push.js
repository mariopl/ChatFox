/*
Class that will allow us to register for push 
and register in push server
*/
var Push = (function() {	
  //Now we call push.register() to request an endpoint
  var endpoint = localStorage.endpoint || null;
  var socket = io.connect('http://localhost:8443');


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

  socket.on('info', function(socketnickname, msg) {
  if (navigator.push) {

    console.log('---------CHATFOX-------- Notification from ' + socketnickname);
    
    window.navigator.mozSetMessageHandler('push', function() {
    
      var notification = navigator.mozNotification.createNotification(socketnickname, msg);
    
      notification.show();

      notification.onclick = function onclick() {
        forgetNotification();
        app.launch();
      };

      if (!localStorage.notificationsReceived) {


      localStorage.notificationsReceived = 1;

    } else if (localStorage.notificationsReceived) {

      localStorage.notificationsReceived++;
    }
    });
  }
  });

});
