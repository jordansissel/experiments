
class TubeAddress
  IPv4MASK = 0xFFFFFFFF # 255.255.255.255

  def initialize(addr)
    @address, cidr, unused = addr.split("/") + ["32"]

    @address_int = self.class.ip_to_num(@address)
    @cidr = cidr.to_i
    @base = @address_int & cidr_mask
  end # def initialize

  def cidr_mask
    # Convert /24 to 0xffffff00, etc
    @cidr_mask ||= IPv4MASK ^ ((1 << (32 - @cidr)) - 1)
  end # def cidr_mas

  def include?(addr)
    addr_int = self.class.ip_to_num(addr)
    #printf "base: %08x\n", @base
    #printf "addr: %08x\n", addr_int
    #printf "mask: %08x\n", cidr_mask
    #printf "full: %08x\n", (addr_int & cidr_mask)
    return addr_int & cidr_mask == @base
  end # def include?

  def self.ip_to_num(addr)
    return addr.split(".").reduce(0) { |s,c| s = (s << 8) + (c.to_i) }
  end # def self.ip_to_num

  def to_s
    return "#{@address}/#{cidr}"
  end
end # class TubeAddress

def time(iterations, &block)
  start= Time.now
  1.upto(iterations) do
    block.call
  end
  duration = Time.now - start
  return duration
end

require "ipaddr"
tube = TubeAddress.new("192.168.0.0/16")
ipaddr = IPAddr.new("192.168.0.0/16")

iterations = 50000
tube_time = time(iterations) { tube.include?("192.168.3.4") }
ipaddr_time = time(iterations) { ipaddr.include?("192.168.3.4") }

def result(name, duration, iterations)
  engine = (RUBY_ENGINE rescue "ruby")
  printf("%15.15s | %5s/%7s | %8.2f | %.2f\n", name, engine, RUBY_VERSION,
         duration, iterations / duration)
end

result("tubeaddr", tube_time, iterations)
result("ipaddr", ipaddr_time, iterations)
