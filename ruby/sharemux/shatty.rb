require "clamp"
require "pty"

class Shatty < Clamp::Command
  subcommand "record", "Record a command" do
    option ["-f", "--file"], "FILE", "file to record to",
      :default => "output.shatty"
    parameter "COMMAND ...", "The command to run",
      :attribute_name => :command

    def execute
      out = File.new(file, "w")
      start = Time.now

      # binary mode.
      buffer = ""
      buffer.force_encoding("BINARY")

      terminal, keyboard, pid = PTY.spawn(*command)
      while true
        # Read from the terminal output and compute the time offset
        begin
          terminal.sysread(16834, buffer)
        rescue Errno::EIO => e
          Process.waitpid(pid)
          puts "Command exited with code: #{$?.exitstatus}"
          break
        end

        time_offset = Time.now - start

        # for each chunk of text read from tmux, record
        # the timestamp (duration since 'start' of recording)
        out.syswrite([time_offset.to_f, buffer.size, buffer].pack("GNA*"))
      end
    end # def execute
  end # subcommand "record"

  subcommand "play", "Play a recording" do
    option ["-f", "--file"], "FILE", "file to play",
      :default => "output.shatty"

    def execute
      input = File.new(file, "r")

      buffer = ""
      buffer.force_encoding("BINARY")
      start = nil

      $stdout.sync = true
      while true
        # Read the header
        input.sysread(16, buffer)
        time_offset, length = buffer.unpack("GN")

        if start.nil?
          start = Time.at(time_offset)
        end

        input.sysread(length, buffer)
        $stdout.write(buffer)

        sleep(time_offset - start.to_f)
      end
    end # def execute
  end # subcommand "play"
end # class Shatty

Shatty.run
