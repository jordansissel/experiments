var ForeverSocket = require("lib/forever_socket")
const FINAL_FRAME = '0';
const MORE_FRAME = '1';
const CLIENT_HEADER = "MDPC01";
const COMMAND_REQ = "\x01";

function MajordomoClient(url) {
  // TODO(sissel): Parse the url and add 'type=req'
  this.url = url + "?type=req";
  this.socket = new ForeverSocket(this.url, "ZWS1.0");
  var self = this;
}

// TODO(sissel): Support multiple frames? Maybe if 'request' is an array?
MajordomoClient.prototype.send = function(service, request, responseCallback) {
  var frames = [
    CLIENT_HEADER,
    service
  ];

  if (typeof request === 'string') {
    request = [request];
  }
  // TODO(sissel): Verify `request` is an array?

  frames = frames.concat(request);

  mdp_frames = [];
  end = frames.length - 1;
  for (i in frames) {
    var flag = (i == end) ? FINAL_FRAME : MORE_FRAME;
    // Each websocket message must be 0payload or 1payload
    // 0 for "final", 1 for "more frames after this one"
    mdp_frames.push(flag + frames[i])
  }

  var buffer = []
  this.socket.send(mdp_frames, function(e) {
    data = e.data
    flag = data.slice(0, 1)
    response = data.slice(1)
    buffer.push(response)
    if (flag == FINAL_FRAME) {
      // Per MDP spec:
      // A REPLY command consists of a multipart message of 4 or more frames, formatted on the wire as follows:
      //
      // Frame 0: Empty (zero bytes, invisible to REQ application)
      // Frame 1: "MDPC01" (six bytes, representing MDP/Client v0.1)
      // Frame 2: Service name (printable string)
      // Frames 3+: Reply body (opaque binary)

      responseCallback(buffer[1], buffer.slice(2))
    }
  });
}

MajordomoClient.prototype.close = function() {
  this.socket.close();
}

module.exports = MajordomoClient;
