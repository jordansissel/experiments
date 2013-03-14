

require "clamp"
class Happy < Clamp::Command
  option "--foo", "VALUE", "Hello world"
  option "--bar", "VALUE", "Hello world bar"
end

class Foo < Happy
  def execute
    puts "--foo was #{foo}"
    puts "--bar was #{bar}"
  end
end
class Bar < Happy; end

class Main < Clamp::Command
  subcommand "foo", "Do the foo", Foo
  subcommand "bar", "Do the bar", Bar
end


Main.run(ARGV)
