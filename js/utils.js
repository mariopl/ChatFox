var Utils = (function() {

  function sendXHR(type, uri, data, cb){
    var xhr = new XMLHttpRequest();
    xhr.open(type, uri);
    xhr.onload = function onLoad(evt) {
    if (xhr.status === 200 || xhr.status === 0) {
      cb(null, xhr.response);
    } else {
      cb(xhr.status);
    };
    xhr.onerror = function onError(e) {
    console.error('onerror en xhr ' + xhr.status);
    cb(e);
    };
  };
  xhr.send(data);
  }
});


