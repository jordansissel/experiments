require "./stemcell"

cell = StemCell.new("ipc:///tmp/excellentsocket")

# Generate a regular expression that is known to cause massive exponential time
# to match in the kind of regular expression engine that Oniguruma (Ruby's) is.
count = 40
str = "a" * count # aaaa...
# New regexp with this: a?a?a?a?aaaa ...
cell.differentiate(Regexp, "a?" * count + "a" * count) 

# Wait a few seconds seconds for the regexp to finish
begin
  result = cell.call(:match, 5000, str)
  puts :result => result
rescue StemCell::Timeout => e
  puts "Timeout; killing bad cell."
  puts :terminate => cell.terminate(1000)
end

puts "Got here!"
