require "benchmark"

require "json"
require "jrjackson"
require "multi_json"

i = 200000
obj = { "hello" => "world", "fizzle" => [ 1, 2, 3 ], "test" => { "one" => "two" } }

puts "Converting the following object to JSON #{i} times"
p obj

Benchmark.bmbm do |x|
  x.report("obj.to_json") { i.times { obj.to_json } }
  x.report("JSON.dump(obj)") { i.times { JSON.dump(obj) } }
  x.report("MultiJson.dump(obj)") { i.times { MultiJson.dump(obj) } }
  x.report("JrJackson::Json.dump(obj)") { i.times { JrJackson::Json.dump(obj) } }
end
