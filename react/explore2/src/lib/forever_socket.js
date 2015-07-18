function ExponentialBackoff(initial, maximum) {
  this.initial = initial;
  this.maximum = maximum;
  this.count = 0
}

ExponentialBackoff.prototype.nextDuration = function() {
  this.count += 1;
  return Math.pow(this.initial, 1.1 * this.count);
}

function ForeverSocket(websocket_url, protocols) {
  this.url = websocket_url;
  this.protocols = protocols || "";
  this.connect();
}

ForeverSocket.prototype.connect = function() {
  this.websocket = new WebSocket(this.url, this.protocols);
  this.registerHandlers(this.websocket)
}

ForeverSocket.prototype.close = function() {
  this.websocket.close()
}

ForeverSocket.prototype.registerHandlers = function(socket) {
  //socket.onopen = ...
  var self = this;
  socket.onopen = function(e) { self.handleOpen(e) };
  socket.onclose = function(e) { self.handleClose(e) };
  socket.onerror = function(e) { self.handleError(e) };
  socket.onmessage = function(e) { self.handleMessage(e) };
}

ForeverSocket.prototype.handleOpen = function(e) { 
  console.log("Websocket connected: " + this.url);
}

ForeverSocket.prototype.handleClose = function(e) { 
  var self = this;
  setTimeout(function() { self.connect(); }, 200);
}

ForeverSocket.prototype.handleError = function(e) { 
  console.log("Websocket error", e);
}
ForeverSocket.prototype.handleMessage = function(e) { 
  //console.log("Received: " + e.data);
  if (this.onmessage === null || this.onmessage === undefined) {
    return;
  }
  this.onmessage(e);
}

module.exports = ForeverSocket;
