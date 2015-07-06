
require "thread"

class Translog
  def initialize(path)
    @path = path
  end

  def log(action, args)
    fd = open
  end

  def open
    @fd ||= File.new(@path, "a+")
  end
end

# Push: Write 'push' and the ID and the object
# Pop: Write 'pop' and the ID
# Init: Read log, inject any unpopped events
#
# What if the size is smaller than transaction log?
# How to efficiently do compactions of the log?
class PersistentSizedQueue < SizedQueue
  def initialize(size, logfile)
    super(size)
    @path = logfile
    @fd = 
  end

  def push(obj)
    # write to disk
    super
  end

  def pop(obj)
    super
    # write to disk
  end
end

class Translog
  def initialize(path)
    @path = path
  end

  def 
end
