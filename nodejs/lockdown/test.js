var net = require("net");
var lockdown = require("./native/lockdown")

var server = new net.Server()
server.on("error", (e) => {
  console.log("Before lockdown, server.listen() should succeed, but failed?!", e.message);
  server.close()
})
server.on("listening", () => {
  console.log("Before lockdown, server.listen() should succed, and did! :)");
  server.close()
})
server.listen({ port: 0 })

lockdown.lockdown()

var server2 = new net.Server()
server2.on("error", (e) => {
  console.log("After lockdown, server.listen() failed. Good!");
  console.log("  The error was: " + e.message);
  server2.close()
})
server2.on("listening", () => {
  console.log("Listening should have failed, but was successful!?");
  server2.close()
})
server2.listen({ port: 0 })
