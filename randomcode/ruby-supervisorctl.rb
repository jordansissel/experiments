# Example of using ruby's net/http to send requests to a webserver listening on
# a unix socket. Traditionally this is awkward because most http libraries only
# support TCP sockets. Luckily, the net/http module is written in a modular
# way so we can reuse the HTTP features on our own socket.

require "net/http"
require "socket"

require "rubygems"
require "xml/libxml/xmlrpc" # gem libxml-xmlrpc
require "ap" # gem awesome_print

# Net::HTTP requests internally use Net::BufferedIO, so we must, too.
sock = Net::BufferedIO.new(UNIXSocket.new("/var/run/supervisor.sock"))

# Make a new request, exec it on our unix socket.
request = Net::HTTP::Post.new("/RPC2")
request.content_type = "text/xml"

# See http://supervisord.org/api.html
# Call supervisor.getAllProcessInfo
request.body = XML::XMLRPC::Builder.call("supervisor.getAllProcessInfo")
request.exec(sock, "1.1", "/RPC2")

# Wait for and parse the http response.
begin
  response = Net::HTTPResponse.read_new(sock)
end while response.kind_of?(Net::HTTPContinue)
response.reading_body(sock, request.response_body_permitted?) { }

# Parse the XMLRPC response
xml = XML::XMLRPC::Parser.new(response.body)
ap xml.params
