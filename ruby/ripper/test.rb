require "ruby_parser"
require "sexp_processor"
require "ap"

data = Ruby19Parser.new.parse(DATA.read)

class SP < SexpProcessor
  def process_if(exp)
    event = exp.shift
    condition = process(exp.shift)

    puts :condition => condition
    if_block = process(exp.shift)
    puts :block => if_block
    else_block = process(exp.shift)

    return s(event, condition, if_block, else_block)
  end

  def process_call(exp)
    event = exp.shift
    receiver = process(exp.shift)
    name = exp.shift
    args = []

    if !receiver.nil?
      puts method_name(receiver) => name
    end

    while !exp.empty?
      args << process(exp.shift)
    end
    return s(event, receiver, name, args)
  end

  def method_name(exp)
    return if exp.nil?
    case exp.first
      when :call; return exp[2]
      when :ivar; return exp[1]
    end
  end
end

SP.new.process(data)

__END__
logger.debug("hello world") if logger.debug?
@logger.debug("foo", {}) if @logger.debug?

logger.debug("hello world")
@logger.debug("foo", {})
