class TTY
  class << self
    def singleton
      @tty ||= TTY.new
    end

    def read(*args)
      singleton.read(*args)
    end

    def write(*args)
      singleton.write(*args)
    end
  end # class methods

  attr_accessor :keyboard
  attr_accessor :terminal

  def initialize
    # make a pipe for input
    self.keyboard, @keyboard_input = IO.pipe
    # default output to stdout
    self.terminal = STDOUT
  end

  # Read from stdout
  def read(*args)
    terminal.read(*args)
  end

  # Write to stdin
  def write(*args)
    @keyboard_input.write(*args)
  end
end # class TTY

class Pipe
  class NotStartedYet < StandardError; end
  class AlreadyStarted < StandardError; end

  attr_accessor :input
  attr_accessor :output

  def initialize(*args)
    @args = args
    self.input = TTY.singleton.keyboard
    self.output = STDOUT
  end # def initialize

  def inspect
    return "<#{self.class.name}##{object_id} input=#{input} output=#{output} args=#{@args.inspect}>"
  end # def inspect

  def |(receiver)
    receiver = `#{receiver}` if receiver.is_a?(String)

    # pipe our output to the receiver
    start(receiver)

    # Return the receiver so we can chain commands.
    return receiver
  end # def |

  def start(receiver=nil)
    reader, self.output = IO.pipe
    if receiver.nil?
      receiver = TTY.singleton
      receiver.terminal = reader
    else
      receiver.input = reader
    end

    #p @args => [input, output]
    @pid = Process.fork do
      reader.close
      child
    end

    # parent doesn't need access to the output.
    output.close

    return receiver
  end # def start

  def wait
    raise NotStartedYet.new if @pid.nil?
    Process.waitpid(@pid)
  end # def wait

  def child
    # redirect stdin/stdout through the pipes
    STDIN.reopen(input)
    STDOUT.reopen(output)

    # Close the old FDs now that we have STDIN and STDOUT dup'd
    input.close
    output.close
    exec(*@args)

    # if exec fails, error appropriately
    stderr.puts("Failed running #{@args.inspect}")
    exit 1
  end # def child
end # class Pipe

def `(string)
  Pipe.new("sh", "-c", string)
end

require "pry"
binding.pry

#seq = `seq 15` | `grep 5`
#puts seq.start.read
#seq.wait
