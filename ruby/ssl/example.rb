require "openssl"
require "socket"

sslcontext = OpenSSL::SSL::SSLContext.new
sslcontext.ssl_version = :TLSv1

# The OpenSSL docs seem to indicate that 'verify_callback'
sslcontext.verify_mode = OpenSSL::SSL::VERIFY_PEER

tcp = TCPSocket.new("twitter.com", 443)
tls = OpenSSL::SSL::SSLSocket.new(tcp, sslcontext)
10.times do
  begin
    tls.connect_nonblock
  rescue OpenSSL::SSL::SSLError => e
    raise e if e.to_s !~ /read would block/
  end

  sleep 0.1
end

puts "Should not get here."

