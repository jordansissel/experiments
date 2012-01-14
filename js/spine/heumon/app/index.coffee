require("lib/setup")

Spine   = require("spine")
{Stage} = require("spine.mobile")
EventsController = require("controllers/events")

class App extends Stage.Global
  constructor: ->
    super
    @log("Initialized")
    #Spine.Route.setup(history: true)
    Spine.Route.setup(shim: true)

    # Create the events controller
    @events_controller = new EventsController

    @navigate "/events"

module.exports = App
