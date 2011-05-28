require 'drb'


class TestServer
    def doit
          "Hello, Distributed World"
            end
end


aServerObject = TestServer.new
server = DRb.start_service('druby://127.0.0.1:0', aServerObject)
puts server.inspect
puts server.config.inspect
puts server.public_methods.inspect
DRb.thread.join 
