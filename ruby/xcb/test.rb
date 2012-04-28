require "ffi"
require "insist"
require "pry"
require "./xcb"

module X
  WINDOW_TYPE_INPUT_OUTPUT = 1
  WINDOW_TYPE_INPUT_ONLY = 2

  class Display
    def initialize(name=nil)
      @connection = XCB::xcb_connect(name, nil)
      # TODO(sissel): check for error
    end # def initialize

    def window(x, y, width, height, &block)
      return X::Window.new(@connection, :x => x, :y => y,
                           :width => width, :height => height, &block)
    end # def window

    def screens
      setup = XCB::xcb_get_setup(@connection)
      screens = XCB::xcb_setup_roots_iterator(setup)
      return [screens[:data]] # get first screen
    end # screens

    def flush
      XCB::xcb_flush(@connection)
    end # def flush

    def disconnect
      XCB::xcb_disconnect(@connection)
    end # def disconnect
  end # class Display

  class Window
    def initialize(connection, options, &block)
      @connection = connection

      if options[:id]
        @window_id = options[:id]
      else
        create(options)
      end
    end # def initialize

    def create(options)
      # set defaults
      options = { :x => 0, :y => 0 }.merge(options)
      @window_id = XCB::xcb_generate_id(@connection)
      setup = XCB::xcb_get_setup(@connection)
      roots_iter = XCB::xcb_setup_roots_iterator(setup)
      screen = roots_iter[:data] # get first screen
      cookie = XCB::xcb_create_window(@connection,
                                      # window depth, copy from parent
                                      screen[:root_depth],
                                      @window_id, # the window id 
                                      screen[:root][:id], # parent
                                      options[:x], options[:y],  # coordinates
                                      options[:width], options[:height], # geom
                                      0, # border width
                                      WINDOW_TYPE_INPUT_OUTPUT, # window class
                                      screen[:root_visual], # visual?
                                      0, nil);
    end # def create

    def id
      return @window_id
    end

    def map
      XCB::xcb_map_window(@connection, @window_id)
    end # def map

    def reparent(new_parent_window, x=nil, y=nil)
      x ||= 0
      y ||= 0
      p XCB::xcb_reparent_window(@connection, @window_id, new_parent_window, x, y)
    end
  end # class Window
end # module X

display = X::Display.new(ENV.fetch("DISPLAY", ":0"))
window = display.window(50, 80, 350, 350)
xterm = X::Window.new(display.instance_eval { @connection }, :id => 46137378)
window.map

xterm.reparent(window.id, 0, 0)
display.flush

sleep 5

display.disconnect
