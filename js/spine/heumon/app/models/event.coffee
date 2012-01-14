Spine = require("spine")

class Event extends Spine.Model
  @configure "Event", "name", "config"
  @extend Spine.Model.Local

# Create some default events
if Event.first() == undefined
  # Create some events
  new Event(name: "ibuprofen", config: {
    radio: [ 1, 2, 3 ]
  }).save()

  new Event(name: "diaper", config: {
    check: [ "poop", "pee" ]
  }).save()
# end data

module.exports = Event
