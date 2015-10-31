require "insist"

shared_examples_for "fancy pants" do
  it "should be fun" do
    insist { [ "fun" ] }.any?
  end
end

describe "something" do
  it_behaves_like "fancy pants"
end
