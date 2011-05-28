require "Foo"

1.upto(100000) do |value|
  x = Foo.new
  x.str = value.to_s
  GC.start
  Thread.pass
  if x.str != value.to_s
    puts "#{value.to_s.inspect} != #{x.str.inspect}"
  end
end
