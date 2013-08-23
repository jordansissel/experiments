
require "ffi"

module LibC
  extend FFI::Library
  ffi_lib 'c'

  # Ok so the 2nd arg isn't really a string... but whaatever
  attach_function :prctl, [:int, :string, :long, :long, :long], :int
end

5.times do  |i|
  Thread.new(i) {
    LibC.prctl(15, "hello #{i}", 0, 0, 0)
    sleep 3600
  }
end

LibC.prctl(15, "main", 0, 0, 0)
sleep 3600

