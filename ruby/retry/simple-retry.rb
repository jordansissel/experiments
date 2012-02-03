$count = 0

# Mock a crappy remote API call that could toss an exception
# on some upstream error. It also mocks a return value of ':pending'
# when it's not complete and returns ':happy' when it's complete.
def crappy_api_call
  $count += 1

  # First two calls fail
  raise "OH SNAP" if $count < 3

  # Next few calls say pending
  return :pending if $count < 5

  # Then finally done
  return :happy if $count > 5
end

begin
  # crappy_api_call throws an exception on upstream errors
  # but we also want to wait until it returns something other than :pending
  # so raise "still pending" if it's still :pending
  raise "still pending" if crappy_api_call == :pending
rescue => e
  p :exception => e
  sleep 1
  retry
end

puts "Ready!"
