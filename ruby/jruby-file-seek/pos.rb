require "insist"
require "rspec"

describe "File#pos = 0" do
  paths = [ 
    "file:/#{File.join(File.dirname(__FILE__), "input.jar")}!/input",
    "input"
  ]

  paths.each do |path|
    context path do
      subject { File.new(path, "rb") }
      it "should seek to the beginning" do
        # Read the same chunk twice.
        first = subject.read(16)
        subject.pos = 0
        second = subject.read(16)
        insist { first } == second
      end
    end
  end
end

describe "File#pos" do
  paths = [ 
    "file:/#{File.join(File.dirname(__FILE__), "input.jar")}!/input",
    "input"
  ]

  paths.each do |path|
    context path do
      subject { File.new(path, "rb") }
      it "should report expected read positions" do
        insist { subject.pos } == 0
        first = subject.read(16)
        insist { subject.pos } == 16
        subject.pos = 0
        insist { subject.pos } == 0
        second = subject.read(16)
        insist { subject.pos } == 16
      end
    end
  end
end
