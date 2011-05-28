require "rubygems"
require "eventmachine"

class A < EM::Connection
  def post_init
    start_tls
  end

  def ssl_handshake_completed
    puts get_peer_cert
    close_connection
  end

  def unbind
    EM.stop_event_loop
  end
end

EM.run do
  EM.connect "mail.google.com", 443, A
end
