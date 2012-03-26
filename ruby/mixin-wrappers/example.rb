module Prefix
  def self.included(klass)
    klass.filter do |event|
      "Foo #{event}"
    end
  end
end

class Foo
  class << self
    def filters
      @filters ||= []
    end

    def filter(&block)
      @filters ||= []
      @filters << block
    end
  end # class << self

  include Prefix
  def hello(message)
    self.class.filters.each do |filter|
      message = filter.call(message)
    end

    puts message
  end
end

puts Foo.new.hello("foo")
