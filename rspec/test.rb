describe "before" do
  context "each" do
    before do
      skip("Skipping each!")
    end

    it "ok" do
      puts "OK"
    end
  end

  context "all" do
    before :all do
      skip("Skipping all!")
    end

    after :all do
      raise
    end

    it "ok" do
      puts "OK"
    end
  end
end
