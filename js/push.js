/*
Class that will allow us to register for push 
and register in push server
*/
console.log('PUSH.JS   dentro de push.js');

var emisor = 'Chatfox';
var msg = 'Nuevo mensaje de chat';
var Push = (function() {	
//Now we call push.register() to request an endpoint
    var endpoint = localStorage.endpoint || null;
    var socket = io.connect('http://localhost:8443');

    socket.emit('hello');

console.log('PUSH.JS    tu endpoint es: ' + endpoint); 
   
  if (navigator.push) {    
    window.navigator.mozSetMessageHandler('push', function() {

      // console.log('-----------------CHATFOX NOTIFICATION---------------- EMISOR: ' + emisor + ' MENSAJE: ' + msg)

      // if (!localStorage.notificationsReceived) {
      //   localStorage.notificationsReceived = 1;
      // } else if (localStorage.notificationsReceived) {
      //   localStorage.notificationsReceived++;
      // }
      
      // var notification = navigator.mozNotification.createNotification(localStorage.ultimoEmisorRecibido, localStorage.ultimoMensajeRecibodo);
    
      // notification.show();
    });

    window.navigator.mozSetMessageHandler('push-register', function() {
console.log('PUSH.JS     dentro push-register');
      navigator.push.unregister(endpoint);

      var req = navigator.push.register();

console.log('PUSH.JS     solicitando nuevo registro de endpoint')
      req.onsuccess = function(e) {
        endpoint = localStorage.endpoint = req.result;  
        socket.emit('new endpoint', endpoint);
console.log('PUSH.JS    tu nuevo endpoint es: ' + endpoint); 
      }
   
      req.onerror = function(e) {
       alert("Error getting a new endpoint: " + JSON.stringify(e));
     }
    });
  }

  if(!endpoint){
    if (navigator.push) {
console.log('PUSH.JS    solicitando registro de endpoint')
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
    endpoint = localStorage.endpoint;
    socket.emit('user endpoint', endpoint);
 
  }
})();
