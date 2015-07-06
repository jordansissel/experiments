
describe "one" do
  let(:one) { 1 }

  describe "and two" do
    let(:two) { 2 }

    it "added together equals 3" do
      expect(one + two).to(eq(3))
    end
  end
end
