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
        var socket = io.connect('http://192.168.1.71:8443');
        socket.emit('user endpoint', endpoint); 
    	}
    	
    	req.onerror = function(e) {
         alert("Error getting a new endpoint: " + JSON.stringify(e));
      }
    } 
  } else {

    var endpoint = localStorage.endpoint;
    var socket = io.connect('http://192.168.1.71:8443');
        socket.emit('user endpoint', endpoint); 
  }

  //alert('Tu endpoint es: ' + endpoint); 

  /*// Listen to push notifications
  window.navigator.mozSetMessageHandler('push', function onPush(version) {
    var channel = [] //an array of all endpoints or extract it from the database in other case;
    var version = //the last version value of the database;
//  for (channel i = channel.length; i >= 0; i--) {
      //for each endpoint, if its version is lower we sent it a notification
    Notifications.notify();
  });
/*
  function sendPushTo(endpoint) {
    // We can do this even if the platform doesn't support push. We cannot receive
    // but we can still send notifications...
    Utils.sendXHR('PUT',endpoint, "version=" + new Date().getTime());
  }
*/

  return {
	  //sendPushTo: sendPushTo,
 
  }
});
