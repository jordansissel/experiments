Spine = require("spine")
{Panel} = require("spine.mobile")

Model =
  Event: require("models/event")
  EventInstance: require("models/event-instance")

class EventsList extends Panel
  title: "Heumon"
  className: "events-list listview"
  events:
    'tap .event-list-item': 'choose'
    'keyup #event-filter': 'search'
    
  constructor: ->
    super
    # Refresh when any Event data changes
    Model.Event.bind("refresh", @render)
    @render()

  sorted_events_list: () ->
    @log(Model.Event.all())
    keys = (e.name for e in Model.Event.all())
    return keys.sort()

  render: ->
    @html require("views/events/index")(@)

  choose: (event) ->
    name = $(event.target).text().trim()
    event.preventDefault()

    # go to /events/:name
    @navigate("/events", name, trans: "right")

  search: (event) ->
    @log(event)
    text = $(event.target).val()
    @log(text)

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
    if params
      @name = params.name
      @event = (Model.Event.select (c) => c.name == @name)[0]
      # TODO(sissel): Error if @event is not defined
    @data = Model.EventInstance.select (c) => c.name == @name
    @log("Data", @data)
    @render()

  render: ->
    @html require("views/events/event")(@)

    # Update the title
    $("header h2", @el).html(@name)
  
  back: ->
    @navigate("/events", trans: "left")

  create: ->
    @navigate("/events", @name, "create", trans: "right")
# end class Event

class EventCreator extends Panel
  title: "Create new event"

  events:
    # mobile safari ignores <label for="id"> for clicking things.
    # Implement it now.
    "tap label": "label_for_click"
    "submit form#event-data": "save"

  constructor: ->
    super
    @addButton("Cancel", @cancel)
    @addButton("Save", @save).addClass("green right")

    # Set up a callback when this panel is made active
    @active(@update)

  update: (params) ->
    if params
      @name = params.name
      @event = (Model.Event.select (c) => c.name == @name)[0]
      # TODO(sissel): Error if @event is not defined
    @render()

  render: ->
    @html require("views/events/create-event")(@)

    # Do any extra magic to generate the event stuff.
    # Update the title
    $("header h2", @el).html(@name)

    # Go through the event config and generate form elements.
    @log("Create event", @event.config)
    form = $("article form#event-data", @el)
    for label, ui of @event.config
      for type, config of ui
        @log("type", type)
        method = "generate_" + type
        if @[method]
          # Call generate_radio, or whatever 'type' is
          el = @[method](label, config)
          el.appendTo(form)
        else
          @log("I don't know how to generate UI for '" + type + "'")
      # for .. of ui
    # for ... of @event.config

  save: ->
    # Hackish way to turn the form data into an object.
    # First ask jQuery to turn the form into a url query (foo=bar&baz=...)
    serialized = $("#event-data").serialize()
    data = {}

    # Then parse that serialized string into an object
    for entry in serialized.split("&")
      [key, value] = (unescape(x) for x in entry.split("="))
      if data[key]? and typeof data[key] == "string"
        # Got a duplicate key, convert this to an array.
        data[key] = [data[key]]
        data[key].push(value)
      else
        data[key] = value

    # Make a new EventInstance
    event_instance = new Model.EventInstance(name: @name, settings: data)
    event_instance.save()
    @log(event_instance)

    @navigate("/events", trans: "left")

  cancel: ->
    # Go back to /events/:name
    @navigate("/events", @name, trans: "left")

  # TODO(sissel): These generate methods should probably go in a module or something.
  generate_radio: (label, config) ->
    # Assert config is an array.
    el = $("<span>").addClass("radio")
    el.append($("<span>").addClass("label").html(label))
    for value in config
      id = "generate-radio-" + label + "-" + value
      $("<span>").addClass("radio-item")
        .append($("<input type='radio'>").attr("name", label).val(value).attr("id", id))
        .append($("<label>").attr("for", id).html(value))
        .appendTo(el)
    return el

  generate_checkbox: (label, config) ->
    # Assert config is an array.
    el = $("<span>").addClass("checkbox")
    el.append($("<span>").addClass("label").html(label))
    for value in config
      id = "generate-checkbox-" + label + "-" + value
      $("<span>").addClass("radio-item")
        .append($("<input type='checkbox'>").attr("name", label).val(value).attr("id", id))
        .append($("<label>").attr("for", id).html(value))
        .appendTo(el)
    return el

  # Mobile Safari (iPhone) does not have proper behavior with <label> tags
  # and form elements. So I have to implement that.
  label_for_click: (e) ->
    target = $(e.target)
    # <label for="some id">
    id = target.attr("for")
    @log("id: " + id)

    input_el = $("#" + id)
    @log(input_el.attr("type"))
    if input_el.attr("type") == "checkbox"
      # Toggle checkbox
      input_el.attr("checked", if input_el.attr("checked") == "true" then "false" or "true")
    else
      # Assume radio box, just set true.
      input_el.attr("checked", true)

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
