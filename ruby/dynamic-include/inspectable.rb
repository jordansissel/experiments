module Example
  def self.Inspectable(*ivars)
    mod = Module.new
    mod.instance_eval do
      define_method(:inspect) do
        ivars = instance_variables if ivars.empty?
        str = "<#{self.class.name}(@#{self.object_id}) "
        ivars.each do |ivar|
          str << "#{ivar}=#{instance_variable_get(ivar).inspect} "
        end
        str << ">"
        return str
      end
    end
    return mod
  end
end

class Test
  include Example.Inspectable(:@hello)
  def initialize
    @hello = "testing"
    @world = "fizzle"
  end
end

a = Test.new
puts a.inspect
