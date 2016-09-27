class Die < StandardError; end

# Generate a regular expression that is known to cause massive exponential time
# to match in the kind of regular expression engine that Oniguruma (Ruby's) is.
count = 40
str = "a" * count # aaaa...
re = Regexp.new("a?" * count + "a" * count) # a?a?a?a?aaaa ...

puts "Input: #{str}"
puts "Regexp: #{re}"

# Perform the match in a separate thread.
t = Thread.new { re.match(str) }

# Wait for the match to complete
result = t.join(5)

# nil on join means the join attempt timed out.
if result.nil?
  puts "Thread not done yet. Trying to interrupt."
  t.raise(Die)
else
  puts "Thread done!"
  exit(0)
end

# Try to join again
result = t.join(5)
if result.nil?
  puts "Thread still not done, even after an interrupt attempt. Exiting..."
  exit(1)
else
  puts "Thread done (after interrupting)!"
end
