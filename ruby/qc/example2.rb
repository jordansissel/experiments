require "./test"
require "insist"

class Whatever < Quality::Control
  before do
    @a = rand
  end
  after do

  end

  10.times do |i|
    test do
      sleep 1
      insist { @a } < 0.5
    end
  end
end

class Another < Quality::Control
  test "sleepy thing" do
    sleep 3
    raise "OMG"
  end
end

