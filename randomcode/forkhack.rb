#!/usr/bin/env ruby


lockfile = "/tmp/tmplock"
fd = File.new(lockfile, File::CREAT)
puts "Waiting for lock"
fd.flock(File::LOCK_EX)
puts "Got lock"

puts "Forking"
childpid = fork
puts childpid
if !childpid
  fd.close
  Signal.trap("TERM", "SIG_IGN")
  Signal.trap("INT", "SIG_IGN")
  Signal.trap("ALRM", "SIG_IGN")
  newfd = File.new(lockfile)
  puts "child waiting on lock"
  newfd.flock(File::LOCK_EX)
  puts "child has lock, exiting..."
else
  exec("sleep 20")
end

