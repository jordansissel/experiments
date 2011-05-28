require "rubygems"
require "thread"
require "eventmachine"

module EventMachine
  # A faster Channel class that uses a file descriptor to signal
  # EventMachine of new data rather than using EventMachine.schedule (which
  # uses a timer under the hood)
  #
  # Should be threadsafe.
  class FastChannel < EventMachine::Channel

    class Reader < EventMachine::Connection
      def initialize(channel)
        super()
        @channel = channel
      end

      def notify_readable
        @channel.notify_readable
      end # def notify_readable
    end

    def initialize
      @reader, @writer = IO.pipe
      @uid = 0
      @queue = ::Queue.new   # use thread's Queue, not EventMachine's

      # I know, using locks in EM code. This is so we can more easily
      # use EM code (like AMQP) safely in non-EM code.
      # TODO(sissel): Allow disabling of the lock if we agree to not
      # access us from threads.
      @subscription_lock = Mutex.new
      @subscriptions = {}
      @watcher = EventMachine.watch(@reader, Reader, self)
      @watcher.notify_readable = true
      @watcher.notify_writable = false
    end # def initialize

    def subscribe(*a, &b)
      name = nil
      @subscription_lock.synchronize do
        name = @uid
        @uid += 1
        @subscriptions[name] = EventMachine::Callback(*a, &b)
      end
      return name
    end # def subscribe

    def unsubscribe(name)
      @subscription_lock.synchronize do
        @subscriptions.delete name
      end
    end # def unsubscribe

    def push(*items)
      items.each { |item| @queue << item }
      # TODO(sissel): write one signal per item?
      @writer.syswrite("1")
      #@writer.flush
    end

    def pop
      # TODO(sissel): Implement
      raise NotImplementedError("#{self.class.name}#pop is not supported")
    end

    def notify_readable
      maxrounds = 30
      rounds = 0
      while !@queue.empty? && rounds < maxrounds
        rounds += 1
        @reader.sysread(1)
        item = @queue.pop

        @subscription_lock.synchronize do
          subscriptions = @subscriptions.values
        end

        @subscriptions.values.each do |callback|
          callback.call item
        end
      end # while !@queue.empty?
    end # def notify_readable
  end # class FastChannel
end # module EventMachine

if $0 == __FILE__
  delay_threshold = 0.010

  case ARGV[0]
  when "fast"
    channelclass = EventMachine::FastChannel
  when "normal"
    channelclass = EventMachine::Channel
  else
    puts "Usage: #{$0} <fast|normal> [delay_threshold_in_seconds]"
    puts "Default threshold is #{delay_threshold}"
    puts "Example: #{$0} fast 0.010"
    exit 1
  end
  if ARGV.length >= 2
    delay_threshold = ARGV[1].to_f
  end

  queue = Queue.new
  EventMachine.schedule do
    channel = channelclass.new
    channel.subscribe do |item| 
      queue << item 
    end

    Thread.new do 
      while true
        channel.push(Time.now) 
        sleep(0.002)
      end
    end
  end
  Thread.new { EventMachine.run }

  count = 0
  while true
    item = queue.pop
    delay = Time.now - item

    if delay > delay_threshold
      puts "[msg##{count}] delay > #{delay_threshold}: #{Time.now - item}"
    end
    count += 1
  end

end
