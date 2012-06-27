require "openssl"
require "socket"

def time(name, &block)
  start = Time.now
  value = block.call
  duration = Time.now - start
  puts name => duration
  return value
end
  
def poke(host)
  sslcontext = OpenSSL::SSL::SSLContext.new
  sslcontext.ssl_version = :TLSv1

  # The OpenSSL docs seem to indicate that 'verify_callback'
  sslcontext.verify_mode = OpenSSL::SSL::VERIFY_NONE

  tcp = time("connect") { TCPSocket.new(host, 443) }
  tls = OpenSSL::SSL::SSLSocket.new(tcp, sslcontext)
  time("ssl") { tls.connect }
end
