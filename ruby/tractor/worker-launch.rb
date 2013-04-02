
require "rubygems"
require "ffi-rzmq"

class Worker 
  def initialize(mi_endpoint)
    @context = ZMQ::Context.new

    # management interface
    @mi_endpoint = mi_endpoint
    @mi = @context.socket(ZMQ::REQ)

    # TODO(sissel): Set up our own ZMQ::REP socket to listen for work requests.
  end

  def heartbeat
    @mi.send_string("1")
    m = ""
    @mi.recv_string(m)
  end

  def run
    @mi.connect(@mi_endpoint)

    # TODO(sissel): Implement work recievership
    while true
      heartbeat
      break if rand > 0.70
      sleep 0.2
    end

    puts "Worker exiting..."
  end
end

if __FILE__ == $0
  puts :child => $$
  Worker.new(ARGV[0]).run
end
