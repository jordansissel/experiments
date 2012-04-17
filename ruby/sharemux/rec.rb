require "pty"

ENV["TMUX"] = ""

tmux = PTY.spawn("tmux -2 attach")
out = File.new(ARGV[0], "w")

start = Time.now
$stdout.sync = 1
buffer = ""
buffer.force_encoding("BINARY")

while true
  mux[0].sysread(16834, buffer)
  timestamp = Time.now - start
  out.syswrite([timestamp.to_f, buffer.size, buffer].pack("GNA*"))
end

