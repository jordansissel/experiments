var ForeverSocket = require("lib/forever_socket")
const FINAL_FRAME = '0';
const MORE_FRAME = '1';

function Sub(url) {
  // TODO(sissel): Parse the url and add 'type=req'
  this.url = url + "?type=sub";
  this.socket = new ForeverSocket(this.url, "ZWS1.0");
  var self = this;
}

Sub.prototype.setMessageHandler = function(callback) {
  var buffer = [];
  this.socket.setMessageHandler(function(event) {
    var data = event.data;
    var flag = data.slice(0, 1);
    var response = data.slice(1);
    buffer.push(response);
    if (flag == FINAL_FRAME) {
      callback(buffer); // callback w/ full set of frames.
      buffer = [];
    }
  });
};

Sub.prototype.send = function() {
  console.log("Send on a SUB socket is not valid");
};

Sub.prototype.close = function() {
  this.socket.close();
};

module.exports = Sub;
