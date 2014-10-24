require "insist"
class Plugin 
end

class Input < Plugin
end

class Whoa < Input
end

shared_examples_for Plugin do
  it "has a register method" do
    insist { subject }.respond_to?(:register)
  end
end

shared_examples_for Input do
  it_behaves_like Plugin
end


describe Whoa do
  it_behaves_like Input
end
