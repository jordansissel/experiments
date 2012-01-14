require("lib/setup")

Spine   = require("spine")
{Stage} = require("spine.mobile")
EventsController = require("controllers/events")

class App extends Stage.Global
  constructor: ->
    super
    @log("Initialized")
    @events = new EventsController

    Spine.Route.setup(shim: true)
    @navigate "/events"

module.exports = App
