require "openssl"
require "socket"

sslcontext = OpenSSL::SSL::SSLContext.new
sslcontext.ssl_version = :TLSv1

sslcontext.verify_mode = OpenSSL::SSL::VERIFY_PEER
sslcontext.verify_callback = proc do |verified, context|
  puts "Verify: #{verified} / #{context}"
  verified
end
sslcontext.ssl_version = :TLSv1


tcp = TCPSocket.new("twitter.com", 443)
tls = OpenSSL::SSL::SSLSocket.new(tcp, sslcontext)
begin
  tls.connect_nonblock
rescue IO::WaitReadable, IO::WaitReadable => e
  raise e if e.to_s !~ /would block/
  r,w,e = IO.select([tls], [tls], nil, nil)
  $stdout.syswrite(".")
  retry if r.size > 0 || w.size > 0
end
puts "connect_nonblock done"
