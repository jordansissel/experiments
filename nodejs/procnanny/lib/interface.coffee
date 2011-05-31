express = require("express")

class Interface
  constructor: (nanny) ->
    @server = express.createServer()
    @nanny = nanny
    @routes()
  # end constructor

  run: () -> @server.listen(3000)

  shutdown: () -> 
    try
      @server.close()
      @server = undefined
    catch error
      # Ignore
  # end shutdown

  routes: () ->
    @server.get("/", (req, res) => @index(req,res))
    @server.get("/program/:program", (req, res) => @program(req,res))
  # end routes

  index: (request, response) ->
    response.render("index.jade", { programs: @nanny.programs })
  # end index

  program: (request, response) ->
    response.render("program.jade", { 
      program: @nanny.programs[request.params.program] 
    })
  # end index
# end class Interface

exports.Interface = Interface
