require "openssl"
require "socket"

sslcontext = OpenSSL::SSL::SSLContext.new
sslcontext.ssl_version = "TLSv1"

# The OpenSSL docs seem to indicate that 'verify_callback'
sslcontext.verify_mode = OpenSSL::SSL::VERIFY_NONE

tcp = TCPSocket.new("twitter.com", 443)
tls = OpenSSL::SSL::SSLSocket.new(tcp, sslcontext)
begin
  tls.connect_nonblock
rescue OpenSSL::SSL::SSLError => e
  raise e if e.to_s !~ /read would block/
  retry
end
puts "connect_nonblock done"
