require "stringio"
Thread.abort_on_exception = true

THREADVARKEY = :STDOUT_PROXY

class IOLike
  def initialize
    # The main thread still should write to STDOUT
    Thread.current.thread_variable_set(THREADVARKEY, STDOUT)
  end

  def write(*args)
    target.write(*args)
  end

  def target
    t = Thread.current.thread_variable_get(THREADVARKEY)
    if t.nil?
      # Capture other thread $stdout to a StringIO
      t = Thread.current.thread_variable_set(THREADVARKEY, StringIO.new)
    end
    t
  end

  def method_missing(m, *args, &block)
    target.send(m, *args, &block)
  end
end

# Replace global $stdout (affects `puts` and other methods)

$stdout = IOLike.new

a = Thread.new { puts "Hello world!" }
b = Thread.new { p "OK" }

a.join
a.thread_variable_get(THREADVARKEY).tap do |io|
  io.rewind
  puts "A says: `#{io.read}`"
end

b.join
b.thread_variable_get(THREADVARKEY).tap do |io|
  io.rewind
  puts "B says: `#{io.read}`"
end
