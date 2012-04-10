require "./expressor"

class Calc < Expressor
  def initialize
    @ops ||= []
    @values ||= []
    @stack ||= []
    super
  end

  def emit(type, value)
    @ops << type
    @values << value
    @stack << [type, value]
  end # def emit

  def parse(string)
    super(string)
    compile(@stack)
    @stack.clear
  end

  def compile(stack)
    # TODO(sissel): Apply order of operations
    # "hello.world + 3 + test(abc)"
    # [[:identifier, "hello"], [:operator, "."], [:identifier, "world"],
    #  [:operator, "+"], [:integer, "3"], [:operator, "+"],
    #  [:identifier, "test"], [:operator, "("], [:identifier, "abc"],
    #  [:operator, ")"]]
    #
  end
end # class Calc
Calc.new.parse(ARGV[0])
