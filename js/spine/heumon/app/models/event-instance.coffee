Spine = require("spine")

class EventInstance extends Spine.Model
  @configure "EventInstance", "name", "timestamp", "settings"
  @extend Spine.Model.Local

  constructor: (data) ->
    super(data)
    @timestamp ?= (new Date).toISOString()

EventInstance.fetch()

module.exports = EventInstance
