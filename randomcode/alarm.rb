require 'timeout'

if ARGV.length < 2
  STDERR.puts "Usage: #{$0} <timeout> command ..."
  exit 1
end

timeout = ARGV[0].to_f
cmd = ARGV[1..-1]

begin
  Timeout.timeout(timeout) do
    fork do
      exec(*cmd)
      exit 0
    end
    Process.wait
    exit $?.exitstatus
  end
rescue Timeout::Error
  STDERR.puts "Execution expired (timeout == #{timeout})"
  exit 254
end

