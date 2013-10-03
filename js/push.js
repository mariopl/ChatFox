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
        var socket = io.connect('http://192.168.1.37:8443');
        socket.emit('user endpoint', endpoint); 
    	}
    	
    	req.onerror = function(e) {
         alert("Error getting a new endpoint: " + JSON.stringify(e));
      }
    } 
  } else {

    var endpoint = localStorage.endpoint;
    var socket = io.connect('http://192.168.1.37:8443');
        socket.emit('user endpoint', endpoint); 
  }

  //Listen to push notifications
  if (navigator.push) {
  window.navigator.mozSetMessageHandler('push', function() {
    
    var notification = navigator.mozNotification.createNotification("ChatFox", "Notification1");
    
    notification.show();
  });
}

/*
  function sendPushTo(endpoint) {
    // We can do this even if the platform doesn't support push. We cannot receive
    // but we can still send notifications...
    Utils.sendXHR('PUT',endpoint, "version=" + new Date().getTime());
  }
*/

  return {
	  
 
  }
});
