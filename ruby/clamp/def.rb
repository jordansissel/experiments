require "clamp"
require "pry"

class Foo < Clamp::Command
  option "--foo", "FOO", "Hello", :default => "fizz" 
  option "--bar", :flag, "asdf", :default => "fizz" 

  def execute
    binding.pry
    p foo => default_foo
  end
end

Foo.run
