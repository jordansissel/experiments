
require "treetop"
require "./grammar12.rb"
require "insist"

parser = LogStashConfigParser.new
config = File.read("config")

r = parser.parse(config) rescue nil
if r.nil?
  puts parser.failure_reason
else
  puts !r.nil?
end
