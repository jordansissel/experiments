require "rubygems"

module BindToHash
  def hashbind(method, key)
    self.class_eval do
      hashpath = BindToHash.hashpath_gen(key)
      getter = eval "lambda { @data#{hashpath} }"
      setter = eval "lambda { |v| @data#{hashpath} = v }"
      define_method(method, getter)
      define_method("#{method}=", setter)
    end
  end

  def self.hashpath_gen(key)
    path = ""
    elements = key.split("/")
    elements.each do |k|
      next if k == ""
      path = "#{path}[\"#{k}\"]"
    end
    return path
  end
end # modules BindToHash

class String
  def trim_ascii
    if value.is_a?(String)
      (0 .. value.length - 1).each do |i|
        break if !value[i]
        # ruby 1.9 String#[] returns a string, 1.8 returns an int
        # force an int.
        if value[i].to_i >= 128
          value[i] = ""
        end
      end
    end
  end # def trim_ascii
end # class String


class Foo
  extend BindToHash

  def initialize
    @data = Hash.new
    @data["test"] = Hash.new
  end

  hashbind :bar, "test/bar"
end

x = Foo.new
require 'ruby-prof'

RubyProf.start
(1..10000).each do
  x.bar = "Hello"
  x.bar
end

result = RubyProf.stop

# Print a flat profile to text
printer = RubyProf::FlatPrinter.new(result)
printer.print(STDOUT, 0)
