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
    var socket = io.connect('http://192.168.1.103:8443');
    var lastTweet = localStorage.lastTweet;

socket.emit('new tweet', lastTweet); 

console.log('PUSH.JS    tu endpoint es: ' + endpoint); 

    socket.on('info', function(Oemisor, Omsg) {
      emisorinfo = Oemisor;
      msginfo = Omsg;
      cambia(emisorinfo, msginfo);

    });

    function cambia(emisorinfo, msginfo) {
      emisor = emisorinfo;
      msg = msginfo;
console.log('PUSH.JS    Emisor: ' + emisor + ' Mensaje: ' + msg);
    }
   

  if (navigator.push) {    
    window.navigator.mozSetMessageHandler('push', function() {

      // console.log('-----------------CHATFOX NOTIFICATION---------------- EMISOR: ' + emisor + ' MENSAJE: ' + msg)

      // if (!localStorage.notificationsReceived) {
      //   localStorage.notificationsReceived = 1;
      // } else if (localStorage.notificationsReceived) {
      //   localStorage.notificationsReceived++;
      // }
      
      // var notification = navigator.mozNotification.createNotification(emisor, msg);
    
      // notification.show();
    });

    window.navigator.mozSetMessageHandler('push-register', function() {
console.log('PUSH.JS     dentro push-register');
      navigator.push.unregister(endpoint);

      var req = navigator.push.register();

console.log('PUSH.JS     solicitando endpoint')
      req.onsuccess = function(e) {
        endpoint = localStorage.endpoint = req.result;  
        socket.emit('new endpoint', endpoint);
console.log('PUSH.JS    tu endpoint es: ' + endpoint); 
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
