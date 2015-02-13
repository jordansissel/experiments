class Rectangle
  attr_reader :width, :height
  def initialize(width, height)
    @width = width
    @height = height
  end

  def square?
    width == height
  end

  def area
    @width * @height
  end
end

shared_examples_for Rectangle do
  it "correctly computes area" do
    expect(subject.area).to(eq(subject.width * subject.height))
  end
end

describe Rectangle do
  context "when width and height are the same" do
    let(:side) { rand(10000) + 1 }
    subject { Rectangle.new(side, side) }

    it_behaves_like Rectangle
    it "should be square" do
      # invokes subject.square? and expects it to return truthy value.
      expect(subject).to(be_square)
    end
  end

  context "when width and height different" do
    let(:width) { rand(10000) + 1 }
    let(:height) { width + rand(-5000 .. 5000) }
    subject { Rectangle.new(width, height) }

    it_behaves_like Rectangle
    it "should not be square" do
      expect(subject).to_not(be_square)
    end
  end
end
