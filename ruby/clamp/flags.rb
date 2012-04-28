require "clamp"

class Foo < Clamp::Command
  option "--foo", :flag, "Hello", :default => true
  option "--no-foo", :flag, "Hello" do |val|
    @foo = false
  end

  def execute
    p :foo? => foo?
  end
end

Foo.run
