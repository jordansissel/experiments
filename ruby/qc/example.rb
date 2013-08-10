require "./test"
require "insist"

describe "first" do
  before do
    p self => 1
    @a = 1
    define_method(:oops) { 123 }
  end

  after do
    p self => 4
  end

  describe "fancy"do
    before do
      p self => 2
      #@a += 1
    end

    after do
      p self => 3
    end

    test do 
      puts oops
    end
  end
end

suite = Quality::Suite.new
suite.run(Quality::Control)
