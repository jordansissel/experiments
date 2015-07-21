var ForeverSocket = require("lib/forever_socket")

const FINAL_FRAME = '0';
const MORE_FRAME = '1';

function ZWSReq(url) {
  // TODO(sissel): Parse the url and add 'type=req'
  this.url = url + "?type=req";
  this.socket = new ForeverSocket(this.url, "ZWS1.0");
  var self = this;
}

ZWSReq.prototype.send = function(request, responseCallback) {
  this.socket.send(FINAL_FRAME + request, function(e) {
    data = e.data
    console.log(typeof data)
    flag = data.slice(0, 1)
    response = data.slice(1)
    responseCallback(response)
  });
}

ZWSReq.prototype.close = function() {
  this.socket.close();
}

module.exports = {
  ZWSReq: ZWSReq
}
