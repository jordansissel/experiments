class Interval
  def initialize(every, &block)
    @every = every
    @block = block
    schedule
  end

  def schedule(now = Time.now)
    if @next.nil?
      @next = now + @every
    else
      @next += @every
      if @next < now
        # Next check time has already passed (we took too long executing or was
        # not scheduled by the kernel?)
        # Give up and execute next time.
        @next = now + @every
      end
    end

    nil
  end

  def check(now)
    if now > @next
      execute(now)
      schedule(now)
    end

    nil
  end

  def execute(now = Time.now)
    @block.call(now)
    nil
  end
end

count = 0
reports = []

capture = Interval.new(1) do |now|
  reports << [now, count]
end

start = Time.now
report = Interval.new(5) do |now|
  duration = reports.first[0] - reports.last[0]
  delta = reports.first[1] - reports.last[1]
  puts "#{now - start},#{delta / duration}"

  age = now - 10
  reports = reports.reject { |v| v[0] < age }
end


loop do
  now = Time.now
  data = STDIN.sysread(4096)

  count += data.size
  reports << [ Time.now, count ] 

  capture.check(now)
  report.check(now)
end

