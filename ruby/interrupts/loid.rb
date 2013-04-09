require "dcell"

class BadRegexp
  include Celluloid

  def initialize
    count = 40
    str = "a" * count # aaaa...
    # New regexp with this: a?a?a?a?aaaa ...
    @re = Regexp.new("a?" * count + "a" * count)
  end

  def match(str)
    return @re.match(str)
  end
end

child = fork {
  DCell.start(:id => "badre", :addr => "ipc:///tmp/dcell")
  sleep
  exit 1
}

DCell.start(:id => "badre", :addr => "ipc:///tmp/dcell")

badre = DCell::Node["badre"]
future = badre.match!("a" * 40)
puts future
