require "stud/try"
describe "thread" do
  it "whatever" do
    a = 0
    Thread.new do
      while a < 5
        a += 1
        sleep 0.1
      end
    end

    Stud::try(5.times) do
      begin
      expect(a).to(be == 5)
      rescue Exception => e
        p e
      end
    end
  end
end
