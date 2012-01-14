Spine = require("spine")
{Panel} = require("spine.mobile")

class EventsList extends Panel
  title: "Heumon"
  className: "example foo list listview"
  events:
    'tap .event-list-item': 'choose'
    'keyup #event-filter': 'search'
    
  constructor: ->
    super
    @list = [ "diaper", "ibuprofen" ]
    @render()

  render: ->
    @html require("views/events/index")(@)

  choose: (event) ->
    name = $(event.target).text().trim()
    event.preventDefault()
    # go to /events/:name
    @navigate("/events", name, trans: "right")

  search: (event) ->
    console.log(event)
    text = $(event.target).val()
    console.log(text)

class Event extends Panel
  title: "Event"

  events:
    "tap .event-record button": "create"

  constructor: ->
    super
    @addButton("Back", @back)
    @addButton("New", @create).addClass("green right")

    # Set up a callback when this panel is made active
    @active(@update)

  update: (params) ->
    @name = params.name
    console.log(["update", @name])
    @render()

  render: ->
    @html require("views/events/event")(@)

    # Do any extra magic to generate the event stuff.
    # Update the title
    $("header h2", @el).html(@name)

  back: ->
    @navigate("/events", trans: "left")

  create: ->
    @log("Create")
    @navigate("/events", @name, "create", trans: "right")
# end class Event

class EventCreator extends Panel
  title: "Create new event"

  #events:
    #'tap .event-record button': create

  constructor: ->
    super
    @addButton("Back", @back);

    # Set up a callback when this panel is made active
    @active(@update)

  update: (params) ->
    @name = params.name
    @render()

  render: ->
    @html require("views/events/create-event")(@)

    # Do any extra magic to generate the event stuff.
    # Update the title
    $("header h2", @el).html(@name)

  back: ->
    @navigate("/events", @name, trans: "left")
# end class EventCreator

class Events extends Spine.Controller
  constructor: ->
    super
    @events_list = new EventsList
    @event = new Event
    @event_create = new EventCreator

    @routes(
      "/events": (params) -> @events_list.active(params)
      "/events/:name": (params) -> @event.active(params)
      "/events/:name/create": (params) -> @event_create.active(params)
    )

module.exports = Events
