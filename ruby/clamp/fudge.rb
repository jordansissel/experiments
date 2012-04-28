require "clamp"

class Foo < Clamp::Command
  option "--foo", "FOO", "Hello" do |val|
    val.upcase
  end

  def execute
    p :foo => foo
  end
end

Foo.run
