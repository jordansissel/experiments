require "rubygems"
require "ffi"

class Inotify
  module CFunctions
    extend FFI::Library
    ffi_lib FFI::Library::LIBC
    attach_function :inotify_init, [], :int
  end

  include CFunctions

  def initialize
    @fd = inotify_init
    puts "inotify_init returned: #{@fd.inspect}"

    @io = IO.for_fd(@fd)
    puts "inotify_init (through IO.for_fd.fileno) returned: #{@io.fileno.inspect}"
  end
end

inotify = Inotify.new


