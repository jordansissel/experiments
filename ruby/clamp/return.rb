require "clamp/command"
require "rspec"

Fancy = Class.new(Clamp::Command) do
  def execute
    return 1
  end
end

describe Fancy
  subject { Fancy.new("test") }

  it "should return a value from '#run'"
end
