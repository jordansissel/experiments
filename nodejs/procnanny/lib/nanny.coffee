Program = require("./program.js").Program
Interface = require("./interface.js").Interface

class Nanny
  constructor: () ->
    @config_paths = [ "./programs.d", "/etc/procnanny/programs.d" ]
    @programs = {}
    @sequence = 0
  # end constructor

  run: (args) ->
    @register_signal_handlers()
    @parse_config()
    @run_interface()
  # end run

  register_signal_handlers: () ->
    process.on("SIGHUP", () => @reload())
    process.on("SIGINT", () => @shutdown())
    process.on("SIGTERM", () => @shutdown())
  # end register_signal_handlers

  parse_config: () ->
    @start("echo", ["echo", "hello world"])
    @start("sleep1", ["sleep", "9"])
    @start("sleep2", ["sleep", "15"])
    @start("sleep3", ["sleep", "33"])
    @start("sleep4", ["sleep", "74"])
    @start("sleep5", ["sleep", "55"])
    @start("sleep6", ["sleep", "40"])
    @start("sleep7", ["sleep", "45"])
  # end parse_config

  run_interface: () ->
    @interface = new Interface(this)
    @interface.run()
  # end run_interface

  start: (name, args) ->
    program = new Program({name:name, args:args})
    program.start()
    @programs[name] = program
  # end start

  reload: () -> console.log("Reload")

  shutdown: () ->
    console.log("shutting down")
    program.stop() for name, program of @programs
    @interface.shutdown() if @interface?
  # end shutdown
# end class Nanny
  
Nanny.run = (args) ->
  console.log("Starting")
  nanny = new Nanny()
  nanny.run(args)
# end Nanny.run

exports.Nanny = Nanny
exports.run = Nanny.run
