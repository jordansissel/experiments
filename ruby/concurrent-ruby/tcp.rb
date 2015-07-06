require "concurrent"
require "concurrent/executors"


require "socket"

pool = Concurrent::FixedThreadPool.new(5)
server = TCPServer.new(5000)

class Selector
  def initialize(pool)
    @readers = []
    @writers = []
  end

  def add_reader(socket)
    @readers << socket
  end

  def add_writer(socket)
    @writers << socket
  end

  def select(timeout)
    (r,w,e) = IO.select(@readers, @writers, [], timeout)
    if r.nil? && w.nil? && e.nil?
      # Timeout
      return
    end

    r.each(&:writable)
    w.each(&:writable)
  end
end

class Listener
  def initialize(socket, pool, selector)
    @socket = socket
    @pool = pool
    @selector = selector
  end

  def readable
    pool.post do
      connection = Connection.new(@socket.accept, @pool)
      @selector.add_reader(connection)
      @selector.add_writer(connection)
    end
  end

  def writable
    # nothing to do
  end

  def errorable
    # ???
  end

  def to_io
    return @socket
  end
end

class Connection
  def initialize(socket)
    @socket = socket
  end

  def readable
    p :readable => socket
  end

  def writable
    p :writable => socket
  end

  def to_io
    return @socket
  end
end

selector = Selector.new(pool)
selector.add_reader(Listener.new(server, pool, selector))
TIMEOUT = 1
while true
  p :selecting
  selector.select(TIMEOUT)
end
