
def crasher
  loop do
    sleep 0.1
    raise "OMG" if rand(5) == 1
  end
end

def supervise(&block)
  thread = Thread.new do
    begin
      block.call
    rescue => e
      p :exception => e
      retry
    end
  end
end

thread = supervise do
  crasher
end

thread.join
