require "socket"
require "time"
require "thread"
require "json"

Thread.abort_on_exception = true

class Tracer
  def initialize(domain, socktype)
    @icmp = Socket.new(Socket::AF_INET, Socket::SOCK_RAW, Socket::IPPROTO_ICMP)
    @icmp.bind(Addrinfo.ip("0.0.0.0"))
    @socket = Socket.new(domain, socktype, 0)
  end # def initialize

  def trace(ttl, &block)
    @socket.setsockopt(Socket::SOL_IP, Socket::IP_TTL, ttl)
    start = Time.now
    block.call(@socket)

    r,w,e = IO.select([@socket, @icmp], nil, nil, 1)
    if r && r.include?(@icmp)
      data, sender = @icmp.recvfrom(1500)
      packet = IP.unpack(data)
      return packet, sender
    else
      return [nil, nil]
    end
  end # def trace

  def close
    @icmp.close
    @transit.close
  end
end # class Tracer

class Packet
end

class IP < Packet
  attr_accessor :version, :ihl, :dscp, :ecn, :length, :identification, :flags, :fragment_offset, :ttl, :protocol, :checksum, :source, :destination, :payload_data

  def self.unpack(data)
    version_ihl, dscp_ecn, length, id, flags_frag, ttl, protocol, checksum, source, destination, options = data.unpack("CCnnnCCnNNN")

    ip = IP.new
    ip.version = (version_ihl >> 4)
    ip.ihl = version_ihl & 0xF
    ip.dscp = dscp_ecn >> 2
    ip.ecn = dscp_ecn & 0x3
    ip.length = length
    ip.identification = id
    ip.flags = flags_frag >> 13
    ip.fragment_offset = flags_frag & (1 << 13 - 1)
    ip.ttl = ttl
    ip.protocol = protocol
    ip.checksum = checksum
    ip.source = source
    ip.destination = destination

    payload_start = 20
    if ip.ihl > 5
      payload_start += 4
      ip.options = options
    end
    ip.payload_data = data[payload_start .. -1]

    return ip
  end

  def payload
    return case protocol
      when 1; ICMP.unpack(payload_data)
      else; payload_data
    end
  end
end

class ICMP
  attr_reader :type, :code, :checksum, :remainder
  def initialize(type, code, checksum, remainder)
    @type = type
    @code = code
    @checksum = checksum
    @remainder = remainder
  end

  def self.unpack(data)
    return self.new(*data.unpack("CCnN"))
  end
end

def trace(addr, ttl)
  start = Time.now
  packet, sender = Tracer.new(Socket::AF_INET, Socket::SOCK_DGRAM).trace(ttl) do |socket|
    socket.sendmsg("hello", 0, addr)
  end
  duration = Time.now - start

  result = {
    "@timestamp" => Time.now.utc.iso8601(3),
    "@version" => "1",
    "ttl" => ttl,
    "protocol" => "udp",
    "destination" => addr.inspect_sockaddr,
    "duration" => duration,
  }
  if sender.nil?
    result["status"] = "completed"
  elsif sender != addr.ip_address
    result["sender"] = sender.inspect_sockaddr
    result["status"] = "ttl_exceeded"
  end
  return result
end # def trace

def trace_gen(addr)
  return lambda { |ttl| trace(addr, ttl) }
end

targets = ARGV.collect do |target|
  host, port = target.split(":")
  Addrinfo.udp(host, port)
end

queue = SizedQueue.new(20)
workers = targets.size.times.collect do |w|
  Thread.new do
    while block = queue.pop
      (1..30).each do |ttl|
        result = block.call(ttl)
        break if result["status"] == "completed"
        puts result.to_json
        $stderr.puts([result["ttl"], result["destination"], result["sender"]].inspect)
        sleep(0.1 + rand * 0.1)
      end
    end
  end
end

while true
  target = targets[rand(targets.length)]
  queue << trace_gen(target)
  sleep 1
end
