child_process = require('child_process')
EventEmitter = require("events").EventEmitter

# Program:
#   name
#   command+args
#   user
#   environment
#   directory
#   ulimits
#   log output
#   numprocs
#   nice
#   autostart
#   events like upstart?
#   callbacks
#   history

class Program
  constructor: (options) ->
    @name = options.name
    @command = options.args[0]
    @args = options.args.slice(1)
    #@user = options.user
    #@environment = options.environment
    #@directory = options.directory
    #@ulimits = options.ulimit

    #@log_stdout = ...
    #@log_stderr = ...
    @numprocs = options.numprocs or 1
    @nice = options.nice or 0

    @emitter = new EventEmitter()
    @state("new")
  # end constructor
  
  start: () ->
    # TODO(sissel): Track history
    clearTimeout(@start_timer) if @start_timer?
    @emitter.emit("started")
    @state("started")

    # TODO(sissel): Start N procs according to @numprocs
    @child = child_process.spawn(@command, @args)
    @child.on("exit", (code, signal) => @exited(code, signal))
  # end start

  signal: (signal) -> @child.kill(signal) if @child?

  stop: () ->
    # State moves:
    #   if @child is running, move to "stopping"
    #   else, move to "stopped"
    # TODO(sissel): Track history
    console.log("Stopping " + @name)

    if @child?
      @signal("SIGTERM")
      @state("stopping")
    else
      @state("stopped")
    # end if

    clearTimeout(@start_timer) if @start_timer?
  # end stop

  exited: (code, signal) ->
    # TODO(sissel): Track history
    console.log(@name + " exited: " + code + "/" + signal)
    @emitter.emit("exited", code, signal)

    if @state() != "stopping"
      @state("died")
      callback = () => @start()
      @start_timer = setTimeout(callback, 1000)
    else
      @state("stopped")
    # end if
    @child = undefined
  # end exited

  state: (state) ->
    @_state = state if state?
    @_state
  # end state

  pid: () -> @child.pid if @child?
#end class Program

exports.Program = Program
