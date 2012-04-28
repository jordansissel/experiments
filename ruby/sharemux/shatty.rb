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
      #buffer.force_encoding("BINARY")

      STDOUT.sync = true
      terminal, keyboard, pid = PTY.spawn(*command)

      system("stty raw -echo") # yeah, perhaps we should use termios instead.
      Thread.new { STDIN.each_char { |c| keyboard.syswrite(c) } }
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
        out.syswrite([time_offset.to_f, buffer.length, buffer].pack("GNA#{buffer.length}"))
        $stdout.write(buffer)
      end

      system("stty sane")
    end # def execute
  end # subcommand "record"

  subcommand "play", "Play a recording" do
    parameter "[FILE]", "the file to play (same as --file)",
      :attribute_name => :file
    option ["-f", "--file"], "FILE", "file to play",
      :default => "output.shatty"

    def execute
      input = File.new(file, "r")

      buffer = ""
      #buffer.force_encoding("BINARY")
      start = nil

      $stdout.sync = true
      headersize = [1,1].pack("GN").size
      last_time = 0
      while true
        # Read the header
        begin
          input.sysread(headersize, buffer)
          #p input.pos => buffer
          time, length = buffer.unpack("GN")
          buffer = input.sysread(length, buffer)
          #p input.pos => [ time_offset, length ]
        rescue EOFError
          break
        end

        # Sleep if necessary
        sleep(time - last_time) if last_time > 0
        last_time = time

        # output this frame.
        $stdout.syswrite(buffer)
      end
    end # def execute
  end # subcommand "play"
end # class Shatty

Shatty.run
