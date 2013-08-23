require "./bracket1"
require "treetop"
require "./dotfield.rb"
require "benchmark"

require "insist"
#data = { "foo" => "bar", "@fields" => { "fizz" => 123, "nest" => { "egg" => 100 } } }
#key = "nest.egg"
data = { "foo" => "bar", "fizz" => 123, "nest" => { "egg" => 100 } }
key = "[nest][egg]"

parser = DotFieldParser.new
generator = parser.parse(key)
#require "pry"; binding.pry
if generator.nil?
  puts parser.failure_reason
  exit
  #require "pry"
  #binding.pry
end
oldway = OldWay.new(data)

compiled_method = generator.to_lambda

require "pry"; binding.pry
iterations = 1..1000000

reject { generator }.nil?
#insist { oldway[key] } == data["@fields"]["nest"]["egg"]
#insist { compiled_method.call(data) } == data["@fields"]["nest"]["egg"]
insist { oldway[key] } == data["nest"]["egg"]
insist { compiled_method.call(data) } == data["nest"]["egg"]


Benchmark.bmbm(15) do |r|
 r.report("old method") { for i in iterations; oldway[key]; end }
 r.report("compiled") { for i in iterations; compiled_method.call(data); end }
end


