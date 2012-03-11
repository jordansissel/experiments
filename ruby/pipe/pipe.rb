class Pipe
  class NotStartedYet < StandardError; end

  class TTYOut
    def stdin=(io)
      io.reopen(STDOUT)
    end
  end

  attr_accessor :stdin
  attr_accessor :stdout

  def initialize(*args)
    @args = args
    self.stdin = STDIN
    self.stdout = STDOUT
  end # def initialize

  def inspect
    return "<#{self.class.name}##{object_id} stdin=#{stdin} stdout=#{stdout} args=#{@args.inspect}>"
  end # def inspect

  def |(receiver)
    start(receiver)
    return receiver
  end # def |

  def start(receiver=TTYOut.new)
    receiver.stdin, self.stdout = IO.pipe
    p :starting => @args
    @pid = Process.fork { child }
    return receiver
  end # def start

  def wait
    raise NotStartedYet.new if @pid.nil?
    Process.waitpid(@pid)
  end # def wait

  def child
    STDOUT.puts "Running: #{@args}"
    p STDOUT => stdout
    STDIN.reopen(stdin)
    STDOUT.reopen(stdout)
    exec(*@args)

    # if exec fails, error appropriately
    stderr.puts("Failed running #{@args.inspect}")
    exit 1
  end # def child
end # class Pipe

def pipe(*args)
  Pipe.new(*args)
end # def pipe

def `(string)
  Pipe.new("sh", "-c", string)
end

#s = (`echo foo` | `grep hello`)
s = `echo "OK" >&2; seq 50`
s.start
s.wait
