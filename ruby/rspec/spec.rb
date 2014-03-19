require "insist"

describe "Example" do
  value1 = []
  let(:value2) { [] }

  context "value1" do
    it "is hurray!" do
      value1 << "hurray"
      insist { value1.size } == 1
      insist { value1.first } == "hurray"
    end
    
    it "is fuzzy!" do
      value1 << "fuzzy"
      insist { value1.size } == 1
      insist { value1.first } == "fuzzy"
    end
  end

  context "value2" do
    it "is hurray!" do
      value2 << "hurray"
      insist { value2.size } == 1
      insist { value2.first } == "hurray"
    end
    
    it "is fuzzy!" do
      value2 << "fuzzy"
      insist { value2.size } == 1
      insist { value2.first } == "fuzzy"
    end
  end
end
