require "clamp"

class Foo < Clamp::Command
  option "--foo", "FOO", "Hello", :default => "fizz" do |val|
    val.upcase
  end

  def execute
    p foo => default_foo
  end
end

Foo.run
