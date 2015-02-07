require "thread"
require "openssl"
require "socket"

host = ARGV[0]
raise "No host given" unless host
port = 443

if host =~ /:/
  host, port = host.split(":", 2)
  port = port.to_i
end

threads = 10
iterations = 1000000
delay = 1.0 / threads

Thread.abort_on_exception = true

threads.times.collect do 
  Thread.new do
    iterations.times do
      tcp = TCPSocket.new(host, port)
      context = OpenSSL::SSL::SSLContext.new
      context.ciphers = "TLS_DHE_RSA_WITH_AES_128_CBC_SHA"
      ssl = OpenSSL::SSL::SSLSocket.new(tcp, context)
      ssl.connect
      ssl.close
      $stdout.syswrite(".")
      sleep(delay)
    end
  end
end.map(&:join)
