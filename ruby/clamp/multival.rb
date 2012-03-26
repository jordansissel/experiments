require "clamp"

class Foo < Clamp::Command
  option "--foo", "FOO", "Hello" do |val|
    @foo ||= []
    @foo << val
  end

  def execute
    p :foo => foo
  end
end

Foo.run
