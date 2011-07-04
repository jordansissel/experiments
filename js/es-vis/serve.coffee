express = require("express")
socketio = require("socket.io")

class Interface
  constructor: (procnanny) ->
    @server = express.createServer()
    @socketio = socketio.listen(@server)

    @server.use(express.static(__dirname + "/public"))
    @server.use(express.logger(":method :url (:response-time ms)"))
    @server.use(express.bodyParser())
    @server.use(express.methodOverride())
    @server.use(express.cookieParser())
    @server.use(express.session({ secret: "keyboard cat" }))
    @server.use(@server.router)
    @server.use(express.static(__dirname + "/public"))
    @server.set('views', __dirname + '/views')
    @server.use(express.errorHandler({ dumpExceptions: true, showStack: true }))

    @socketio.sockets.on("connection", (client) => @new_socketio_client(client))
    @routes()
  # end constructor

  new_socketio_client: (client) ->
    # Nothing yet
  # end new_socketio_client

  run: () -> @server.listen(3000)

  shutdown: () -> 
    try
      @server.close()
      @server = undefined
    catch error
      console.log("While shutting down server: " + error)
      # Ignore
  # end shutdown

  routes: () ->
    @server.get("/", (req, res) => @index(req,res))
    @server.get("/test", (req, res) => res.send("Hello"))

    #for name, controller of Controllers
      #new controller(@server, @procnanny)
  # end routes

  index: (request, response) ->
    response.render("index.jade")
  # end index
# end class Interface

exports = module.exports = Interface

interface = new Interface()
interface.run()
