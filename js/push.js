/*
Class that will allow us to register for push 
and register in push server
*/
console.log('PUSH.JS   dentro de push.js');

var Push = (function() {	
//Now we call push.register() to request an endpoint
var endpoint = localStorage.endpoint || null;
var socket = io.connect('http://localhost:8443');

  $(function () {

   if (!localStorage.messagesReceived) {

    localStorage.messagesReceived = 0;

   }

   if (!localStorage.notificationsReceived) {

    localStorage.notificationsReceived = 0;

   }

   if (!localStorage.lastPush) {

    localStorage.lastPush = 0;
   }


  });

socket.emit('hello');

console.log('PUSH.JS    tu endpoint es: ' + endpoint); 

if(new Date().getTime() - lastPush < 10000)
if (navigator.push) {
  if(document.hidden) {
    if (localStorage.notificationsReceived) {
      localStorage.notificationsReceived++;  
    }
    if (localStorage.messagesReceived) {
      localStorage.messagesReceived++;  
    } 
    if (localStorage.lastPush) {
      localStorage.lastPush = new Date().getTime();  
    }     
    var notification = navigator.mozNotification.createNotification('Chatfox', 'Nuevo Mensaje'); 
    notification.show();
  }   

  window.navigator.mozSetMessageHandler('push-register', function() {
    navigator.push.unregister(endpoint);

    var req = navigator.push.register();

    console.log('PUSH.JS     solicitando nuevo registro de endpoint desde push-register')
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
     console.log('---------CHATFOX-------- Endpoint registrado: ' + endpoint);
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
