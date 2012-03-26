require "clamp"

class Foo < Clamp::Command
  parameter "[FOO] ...", "OK", :attribute_name => :foo

  def execute
    p :foo => foo
  end
end

Foo.run
