require "thread"

class Channel
  def initialize(size)
    @buffer = Array.new(size)
    @read = 0
    @write = 0
    @size = size
    @lock = Mutex.new

    # Full blocks writes
    @full_condition = ConditionVariable.new
    # Empty blocks reads
    @empty_condition = ConditionVariable.new
  end # def initialize

  def push(val)
    @lock.synchronize do
      @full_condition.wait(@lock) if full?
      #puts "write(#{@write}): #{val}"
      @buffer[@write] = val
      @write += 1
      @write = 0 if @write == @size
      @empty_condition.signal
    end
  end

  def pop
    return @lock.synchronize do
      @empty_condition.wait(@lock) if empty?
      val = @buffer[@read]
      @buffer[@read] = nil
      @read += 1
      @read = 0 if @read == @size
      @full_condition.signal
      val
    end
  end

  def empty?
    #@lock.synchronize do
      return (@read == @write and @buffer[@read].nil?)
    #end
  end # def empty?

  def full?
    #@lock.synchronize do
    return (@read == @write and !@buffer[@read].nil?)
    #end
  end # def empty?
end
