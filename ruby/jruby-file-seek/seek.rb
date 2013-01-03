require "insist"
require "rspec"

describe "File#seek(0, SEEK_SET)" do
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
        subject.seek(0, IO::SEEK_SET)
        second = subject.read(16)
        insist { first } == second
      end
    end
  end
end

describe "File#seek(0, IO::SEEK_CUR)" do
  paths = [ 
    "file:/#{File.join(File.dirname(__FILE__), "input.jar")}!/input",
    "input"
  ]

  paths.each do |path|
    context path do
      subject { File.new(path, "rb") }
      it "should report expected read positions" do
        insist { subject.seek(0, IO::SEEK_CUR) } == 0
        first = subject.read(16)
        insist { subject.seek(0, IO::SEEK_CUR) } == 16
        subject.seek(0, IO::SEEK_SET)
        insist { subject.seek(0, IO::SEEK_CUR) } == 0
        second = subject.read(16)
        insist { subject.seek(0, IO::SEEK_CUR) } == 16
      end
    end
  end
end
