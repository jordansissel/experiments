
require 'rubygems'
require 'thrift'
$:.push("gen-rb")
require 'user_storage'

class UserStorageHandler
  def store(user)
    puts Thread.current
    puts user.inspect
  end
end

handler = UserStorageHandler.new()
processor = UserStorage::Processor.new(handler)
transport = Thrift::ServerSocket.new(9090)
transportFactory = Thrift::BufferedTransportFactory.new()
#server = Thrift::SimpleServer.new(processor, transport, transportFactory)
server = Thrift::ThreadPoolServer.new(processor, transport, transportFactory)
puts "Starting the server..."
server.serve()
puts "Done"
 
