/*
Class that will allow us to register for push 
and register in push server
*/
var Push = (function() {	
  //Now we call push.register() to request an endpoint
  if (navigator.push) {
	var req = navigator.push.register();
	
	req.onsuccess = function(e) {
	  var endpoint = req.result;
	    debug("New endpoint: " + endpoint );
      this.log.debug('>>>>New endpoint: '+ endpoint);
	}
	
	req.onerror = function(e) {
     debug("Error getting a new endpoint: " + JSON.stringify(e));
    }
  } else {
	  // No push on the DOM
  }
  
  //4.Add a message handler for push notifications inside your app
  function setPushHandler(aHandler) {
    if (pushEnabled && window.navigator.mozSetMessageHandler) {
      window.navigator.mozSetMessageHandler('push', aHandler);
    } // Else?...
  }

  function sendPushTo(endpoint) {
    // We can do this even if the platform doesn't support push. We cannot receive
    // but we can still send notifications...
    Utils.sendXHR('PUT', endPoint, "version=" + version);
  }

  return {
	  sendPushTo: sendPushto,
    setPushHandler: setPushHandler
  }

});

}


