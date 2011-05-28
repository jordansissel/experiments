
require 'rubygems'
require 'thrift'
$:.push("gen-rb")
require 'user_storage'

transport = Thrift::BufferedTransport.new(Thrift::Socket.new("localhost", 9090))
protocol = Thrift::BinaryProtocol.new(transport)
foo = UserStorage::Client.new(protocol)
transport.open()

x = UserProfile.new
x.uid = 3
x.name = "Hello"
x.blurb = "Pants"
puts foo.store(x)
 
