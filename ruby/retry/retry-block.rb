# try(5) do ... end
def try(times=nil, exceptions=[Exception], &block)
  sleeptime = 0.1
  max = 5
  tries = 0
  begin
    tries += 1
    if tries >= times
      # Ran out of tries
      return false
    end
    # Otherwise return the result of the block call
    return block.call
  rescue *exceptions => e
    p :sleeping => sleeptime, :exception => e
    sleep(sleeptime)
    # Exponential back-off until max.
    sleeptime = [max, sleeptime * 2].min
    retry
  end
end

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
  return :happy
end

puts "try(3) ..."
$count = 0
status = try(3, [RuntimeError]) do
  # crappy_api_call throws an exception on upstream errors
  # but we also want to wait until it returns something other than :pending
  # so raise "still pending" if it's still :pending
  raise "still pending" if crappy_api_call == :pending
end

puts "Ready? #{status}"

puts "try(10) ..."
$count = 0
status = try(10) do
  result = crappy_api_call
  raise "still pending" if result == :pending
  # return result from this block.
  result
end

puts "Ready? #{status}"
