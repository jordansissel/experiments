#!/usr/bin/env ruby
#

require "rubygems"
require "amqp"
require "mq"
require "json"
require "ruby-prof"

message = "hello world"
data = { :exchange => "foo", :routing_key => "key", :ticket => 34, :mandatory => 1, :immediate => 1}

out = []
out << AMQP::Protocol::Basic::Publish.new(data)
out << AMQP::Protocol::Header.new(AMQP::Protocol::Basic,
                            message.length, { :content_type => 'application/octet-stream',
                            :delivery_mode => 1,
                            :priority => 0 })
out << AMQP::Frame::Body.new(message)


RubyProf.start
1.upto(10000) do 
  out.each { |o| o.to_s }
  data.to_json
end
results = RubyProf.stop
printer = RubyProf::GraphPrinter.new(results)
printer.print(STDOUT, 0)


