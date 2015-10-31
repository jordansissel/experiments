class RSpec::Core::Runner
  alias_method :run_specs_old, :run_specs
  def run_specs(example_groups)
    require "pry"
    binding.pry
    run_specs_old(example_groups)
  end
end

describe "foo" do
  it "should be ok" do
    puts "OK"
  end
  it "should maybe is ok" do
    puts "MAYBE"
  end
end
