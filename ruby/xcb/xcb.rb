require "ffi"

module XCB; end

# xcb_connection_t
class XCB::Connection < FFI::Struct; end # XCB::Connection

# xcb_extension_t
class XCB::Extension < FFI::Struct; end # XCB::Extension

# xcb_auth_info_ t
class XCB::AuthInfo < FFI::Struct
  layout :namelen, :int32,
    :name, :pointer, # string containing the authentication protocol name
    :datalen, :int32,
    :data, :pointer # interpreted in a protocol-specific manner
end # XCB::AuthInfo

# xcb_setup_t
class XCB::Setup < FFI::Struct
  layout :status, :uint8,
    :pad0, :uint8,
    :protocol_major_version, :uint16,
    :protocol_minor_version, :uint16,
    :length, :uint16,
    :release_number, :uint32,
    :resource_id_base, :uint32,
    :resource_id_mask, :uint32,
    :motion_buffer_size, :uint32,
    :vendor_len, :uint16,
    :maximum_request_length, :uint16,
    :roots_len, :uint8,
    :pixmap_formats_len, :uint8,
    :image_byte_order, :uint8,
    :bitmap_format_bit_order, :uint8,
    :bitmap_format_scanline_unit, :uint8,
    :bitmap_format_scanline_pad, :uint8,
    :min_keycode, :uint8, # xcb_keycode_t == uint8_t
    :max_keycode, :uint8, # xcb_keycode_t == uint8_t
    :pad1, :uint32
end # class XCB::Setup

# xcb_window_t == uint32_t
class XCB::Window < FFI::Struct
  layout :id, :uint32
end

# xcb_screen_t
class XCB::Screen < FFI::Struct
  layout :root, XCB::Window,
    :default_colormap, :uint32, # xcb_colormap_t == uint32_t
    :white_pixel, :uint32,
    :black_pixel, :uint32,
    :current_input_masks, :uint32,
    :width_in_pixels, :uint16,
    :height_in_pixels, :uint16,
    :width_in_millimeters, :uint16,
    :height_in_millimeters, :uint16,
    :min_installed_maps, :uint16,
    :max_installed_maps, :uint16,
    :root_visual, :uint32, # xcb_visualid_t == uint32_t
    :backing_stores, :uint8,
    :save_unders, :uint8,
    :root_depth, :uint8,
    :allowed_depths_len, :uint8
end # class XCB::Screen

# xcb_screen_iterator_t
class XCB::ScreenIterator < FFI::Struct
  layout :data, XCB::Screen,
    :rem, :int32,
    :index, :int32
end # class XCB::ScreenIterator

class XCB::GenericEvent < FFI::Struct
end # class XCB::GenericEvent

class XCB::VoidCookie < FFI::Struct
  layout :sequence, :uint32

  def inspect
    return self[:sequence]
  end
end # class XCB::VoidCookie

module XCB
  extend FFI::Library
  ffi_lib "libxcb"

  typedef :uint32, :window_id
  typedef :uint32, :visual_id

  class << self
    # I couldn't figure out how to make FFI functions exposed via
    #   'attach_function "foo", [...], SomeStruct' to actually 
    # return an object of type SomeStruct. So, this hack appears
    # to be necessary
    #alias_method :orig_attach_function, :attach_function
    def __attach_function(name, args, return_type)
      orig_attach_function(name, args, return_type)

      puts "Wrap #{name}?" => [!return_type.is_a?(Symbol), !return_type.layout.nil?] if !return_type.is_a?(Symbol)
      if !return_type.is_a?(Symbol) and !return_type.layout.nil?
        define_singleton_method(name) do |*args|
          p :wrapped => name
          binding.pry
          retval = send("wrapped_#{name}", *args)
          #return return_type.new(retval)
          return nil
        end
        module_eval do
          p "alias method"
          alias_method "wrapped_#{name}", name
        end
      end
    end
  end

  attach_function "xcb_connect", [:string, :pointer], XCB::Connection
  #xcb_connect_to_display_with_auth_info
  #xcb_connect_to_fd
  #xcb_disconnect
  #xcb_parse_display
  attach_function "xcb_get_setup", [XCB::Connection], XCB::Setup.by_ref
  #xcb_get_file_descriptor
  #xcb_get_maximum_request_length
  attach_function "xcb_wait_for_event", [XCB::Connection], XCB::GenericEvent.by_ref
  #xcb_poll_for_event
  #xcb_connection_has_error
  #xcb_get_extension_data
  #xcb_prefetch_extension_data
  attach_function "xcb_generate_id", [XCB::Connection], :uint32

  # xcb_setup ...
  attach_function "xcb_setup_roots_iterator", [XCB::Setup], XCB::ScreenIterator.by_ref

  attach_function "xcb_create_window", 
    [XCB::Connection, 
     :uint8, # depth
     :window_id, # the window id to create
     :window_id, # the parent for this window
     :int16, :int16, # x, y
     :uint16, :uint16, # width, height
     :uint16, # border_width
     :uint16, # window class
     :visual_id, # visual
     :uint32, # value mask
     :pointer, # uint32* value list
    ], XCB::VoidCookie.by_value

  attach_function "xcb_map_window", [XCB::Connection, :window_id], XCB::VoidCookie
  attach_function "xcb_flush", [XCB::Connection], :int32
  attach_function "xcb_disconnect", [XCB::Connection], :void

  attach_function "xcb_reparent_window", 
    [XCB::Connection,
     :window_id, # the window id to reparent
     :window_id, # the new parent window
     :int16, :int16 # the x, y coordinates in the new parent
    ], XCB::VoidCookie.by_value
end # module XCB
