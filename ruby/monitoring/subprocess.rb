# IO.popen sucks in ruby 1.8.7 and earlier, and it's an easy thing to
# implement, so let's do it better.
class Subprocess
  attr_reader :pid
  attr_reader :status

  public
  def initialize(*args)
    # Handle 'Subprocess.new([command, arg1, arg2])'
    # and also 'Subprocess.new(command, arg1, arg2)'
    args = args.first if args.first.is_a?(Array)
    @stdin = IO.pipe
    @stdout = IO.pipe
    @stderr = IO.pipe
    @args = args
  end # def initialize

  private
  def reader(pipe)
    return pipe[0]
  end # def reader

  private
  def writer(pipe)
    return pipe[1]
  end # def writer

  public
  def start
    @pid = fork
    if @pid.nil?  # child process
      reader(@stdout).close
      reader(@stderr).close
      writer(@stdin).close
      $stdin.reopen(reader(@stdin))
      $stdout.reopen(writer(@stdout))
      $stderr.reopen(writer(@stderr))

      exec(*@args)
      $stderr.puts("exec failed to run; program perhaps not found: #{@args.first}")
      exit(255) # if exec fails
    end

    reader(@stdin).close
    writer(@stdout).close
    writer(@stderr).close
  end # def start

  public
  def wait
    Process.waitpid(@pid)
    @status = $?
  end # def wait

  public
  def stdin
    return writer(@stdin)
  end

  public
  def stdout
    return reader(@stdout)
  end

  public
  def stderr
    return reader(@stderr)
  end
end # class Subprocess

