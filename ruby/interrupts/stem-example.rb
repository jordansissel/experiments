require "./stemcell"

# Set up a subprocess
s = StemCell.new("ipc:///tmp/excellentsocket")

# Make this StemCell become a Hash.
s.differentiate(Hash)

puts "Cell pid: #{s.pid}"
puts "My pid: #{$$}"

# Do things on the hash, executed remotely.
s["foo"] = "hello"
puts "s['foo'] == #{s["foo"]}"

# Clone the object into our process
value = s.clone

# Terminate the cell
s.terminate

# We still keep our value :)
puts value
