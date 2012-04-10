require "./expressor"

class Calc < Expressor
  def initialize
    super
    @stack = []
  end

  def emit(type, value)
    if !@expected.include?(type)
      raise "Got #{type} but expected one of #{@expected}"
    end

    send(type, value)
  end

  def stack
    @stack
  end

  def expect(things)
    @expected = things
  end

  def identifier(value)
    expect [:operator]
    stack.push(value)
  end

  def operator(op)
    left = stack.pop
    right = stack.pop

    stack.push(lambda { left + right })
end
Calc.new.parse(ARGV[0])
