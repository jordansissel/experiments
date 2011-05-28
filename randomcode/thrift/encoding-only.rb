
require 'rubygems'
require 'thrift'
$:.push("gen-rb")
require 'user_storage'

i = StringIO.new
o = StringIO.new

transport = Thrift::IOStreamTransport.new(i, o)
protocol = Thrift::BinaryProtocolAcceleratedFactory.new.get_protocol(transport)

x = UserProfile.new
x.uid = 3
x.name = "Hello"
x.blurb = "Pants"
x.write(protocol)
o.rewind
puts o.read
