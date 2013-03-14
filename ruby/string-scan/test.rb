require "benchmark"

kv_reg1 =  /([^ =]+)=(?:"([^"]+)"|'([^']+)'|([^ ]+))/
kv_reg2 =  /([^ =]+)=((?:"[^"]+")|(?:'[^']+')|(?:[^ ]+))/
#kv_reg2 =  /([^ =]+)=('[^']+')/

input = "hello=world foo='bar baz'"

def scan(str, regex, &block)
  pos = 0
  while true
    result = regex.match(str, pos)
    break if result.nil?
    pos = result.end(0)
    block.call(*result.captures)
  end
end

count = 1000000
Benchmark.bmbm(30) do |r|
  r.report("String#scan reg1") do 
    count.times do
      input.scan(kv_reg1) { |k,v1,v2,v3| v1 || v2 || v3 }
    end
  end
  r.report("String#scan reg2") do 
    count.times do
      input.scan(kv_reg2) { |k,v| ["\"", "'"].include?(v[0,1]) && v[1...-1] || v }
    end
  end

  r.report("my scan reg1") do 
    count.times do
      scan(input, kv_reg1) { |k,v1,v2,v3| v1 || v2 || v3 }
    end
  end
  r.report("my scan reg2") do 
    count.times do
      scan(input, kv_reg2) { |k,v| ["\"", "'"].include?(v[0,1]) && v[1...-1] || v }
    end
  end
end
