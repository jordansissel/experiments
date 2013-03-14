require "clamp"

class Foo < Clamp::Command
  #
  option "--bar", :flag, "Whatever"

  def bar?
    return <whatever value for --bar, true/false usually>
  end


  option "--baz", "WHOA", "asdfasdf"
  def bar
    return <whatever value for --baz ...>
  end
  


  def execute
    puts "--bar: #{bar?}"
  end
end

Foo.run
