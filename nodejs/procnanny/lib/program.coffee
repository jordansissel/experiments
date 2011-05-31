child_process = require('child_process')
EventEmitter = require("events").EventEmitter

class Program
  constructor: (options) ->
    @name = options.name
    @command = options.args[0]
    @args = options.args.slice(1)
    @emitter = new EventEmitter()
    @state("new")
  # end constructor
  
  start: () ->
    @child = child_process.spawn(@command, @args)
    @child.on("exit", (code, signal) => @exited(code, signal))
  # end start

  signal: (signal) ->
    @child.kill(signal)
  # end signal

  stop: () ->
    console.log("Stopping " + @name)
    @state("stopped")
    @signal("SIGTERM")
    clearTimeout(@timer) if @timer?
  # end stop:

  exited: (code, signal) ->
    console.log(@name + " exited: " + code + "/" + signal)
    if @state() != "stopped"
      console.log("Restarting program in 1 second: " + @name);
      callback = () => @start()
      @timer = setTimeout(callback, 1000)
    # end if
  # end exited

  state: (state) ->
    @_state = state if state?
    @_state
  # end state
#end class Program

exports.Program = Program
