var Push = (function() {        

//Now we call push.register() to request an endpoint
    var endpoint = localStorage.endpoint || null;
    var autoendpoint = localStorage.autoendpoint || null;
    var socket = io.connect('http://chatfox.es:8080');


  $(function () {

   if (!localStorage.notificationsReceived) {

    localStorage.notificationsReceived = 0;

   }

  });
   

  if (navigator.push) {
    window.navigator.mozSetMessageHandler('push', function(evt) {
      console.log(autoendpoint);
      console.log(evt.pushEndpoint);

      if(autoendpoint == evt.pushEndpoint) {
      var notification = navigator.mozNotification.createNotification('Ping', 'version = ' + evt.version);
      notification.show();
      localStorage.notificationsReceived++;  
      }

      if(endpoint == evt.pushEndpoint) {
      socket.emit('last message');
      socket.on('lmessage', function(var1, var2){
      var notification2 = navigator.mozNotification.createNotification(var1, var2);
      notification2.show();
      localStorage.notificationsReceived++;  
      socket.close();
      });
      }

    });

    window.navigator.mozSetMessageHandler('push-register', function() {

      navigator.push.unregister(endpoint);

      var req = navigator.push.register();
      var req2 = navigator.push.register();

      req.onsuccess = function(e) {
        var endpoint = localStorage.endpoint = req.result;
        var socket = io.connect('http://chatfox.es:8080');
        socket.emit('new endpoint', endpoint);
        console.log('PUSH-REGISTER: nuevo endpoint --> ' + endpoint);
      }

      req.onerror = function(e) {
       console.log('PUSH-REGISTER: error --> ' + JSON.stringify(e));
     }

     req2.onsuccess = function(e) {
        var autoendpoint = localStorage.autoendpoint = req2.result;
        var socket = io.connect('http://chatfox.es:8080');
        socket.emit('user autoendpoint', autoendpoint);
        console.log('PUSH-REGISTER: nuevo autoendpoint --> ' + autoendpoint);
      }

      req2.onerror = function(e) {
       console.log('PUSH-REGISTER: error --> ' + JSON.stringify(e));
     }
    });
  }

  if(!endpoint){
    if (navigator.push) {
      var req = navigator.push.register();
      var req2 = navigator.push.register();

      req.onsuccess = function(e) {
        endpoint = localStorage.endpoint = req.result;
        socket.emit('user endpoint', endpoint);
        console.log('PUSH: nuevo endpoint --> ' + endpoint);

      }

      req.onerror = function(e) {
       console.log('PUSH: error endpoint--> ' + JSON.stringify(e));
      }

      req2.onsuccess = function(e) {
        autoendpoint = localStorage.autoendpoint = req2.result;
        socket.emit('user autoendpoint', autoendpoint);
        console.log('PUSH: nuevo autoendpoint --> ' + autoendpoint);

      }

      req2.onerror = function(e) {
       console.log("Error getting a new autoendpoint: " + JSON.stringify(e));
       console.log('PUSH: error autoendpoint--> ' + JSON.stringify(e));
      }
   }
 } else {
  autoendpoint = localStorage.autoendpoint;
  endpoint = localStorage.endpoint;
  socket.emit('user endpoint', endpoint);
  socket.emit('user autoendpoint', autoendpoint);

}
})();
