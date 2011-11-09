require "rubygems"
require "awesome_print"

module A
  @test = "Hello"

  def self.included(klass)
    klass.class_eval do
      alias_method :_original_initialize, :initialize
      def initialize(*args)
        _original_initialize(*args)
        @foo = "hello"
      end
    end
  end

  def b
    p @test
  end
end

class B
  def initialize
    ap "initialize B"
    ap @test
  end
end
class B
  include A
end

a = B.new
b = B.new
a.b
