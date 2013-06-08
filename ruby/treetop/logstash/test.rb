
require "treetop"
require "./grammar_nodes"
require "./grammar12.rb"
require "insist"

parser = LogStashConfigParser.new
config = File.read("config")

r = parser.parse(config) rescue nil
if r.nil?
  puts parser.failure_reason
else
  first = r.ruby
  second = parser.parse(first)

  if second.nil?
    puts parser.failure_reason
  else
    puts first == second.ruby
  end
end
