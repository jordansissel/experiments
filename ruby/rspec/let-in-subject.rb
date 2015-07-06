describe "foo" do
  let(:foo) { 3 }
  subject { foo + 4 }
  it "is fun" do
    expect(subject).to(eq(7))
  end
end
