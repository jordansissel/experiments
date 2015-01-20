require "rexml/parsers/streamparser"
require "rexml/document"
require "open3"
require "clamp"

module RAVEn; end
class RAVEn::StreamCLI < Clamp::Command
  option "--device", "DEVICE", "Path to the serial port", :default => "/dev/ttyUSB0"
  parameter "[SSH_COMMAND] ...", "A command, if any, to ssh to a remote host before running 'cu'", :attribute_name => :ssh_command

  def execute
    stream while true
  end

  def stream
    Open3.popen3(*[*ssh_command, "cu", "-l", "/dev/ttyUSB0", "-s", "115200"]) do |stdin, stdout, stderr|
      begin
        Thread.new { IO::copy_stream(stderr, $stderr) }
        parser = REXML::Parsers::StreamParser.new(stdout, RAVEn::XML.new)
        parser.parse
      rescue => e
        stdin.close rescue nil
        stdout.close rescue nil
        stderr.close rescue nil
        raise
      end
    end
  end
end

class RAVEn::XML
  def initialize
    newdoc
  end

  def newdoc
    @stack = [REXML::Document.new]
  end

  def tag_start(name, attributes)
    parent = @stack.last
    element = parent.add_element(name)
    # REXML::Attributes (`element.attributes`) is 100% undocumented.
    # So let's just guess how to add attributes.
    attributes.each do |key, value|
      element.attributes[key] = value
    end
    @stack << element
  end

  def tag_end(name)
    element = @stack.pop
    process_document(element) if @stack.size == 1
  end

  def text(value)
    element = @stack.last
    if element.text.nil?
      element.text = value
    else
      element.text = element.text + value
    end
  end

  def method_missing(m, *args)
    p :unknown => { m => args }
  end

  def process_document(element)
    case element.name
    when "InstantaneousDemand"
      demand = REXML::XPath.first(element, "/InstantaneousDemand/Demand/text()").value.to_i(16)
      multiplier = REXML::XPath.first(element, "/InstantaneousDemand/Multiplier/text()").value.to_i(16)
      divisor = REXML::XPath.first(element, "/InstantaneousDemand/Divisor/text()").value.to_i(16)

      watts = (((demand + 0.0) * multiplier) / divisor) * 1000.0
      puts "Power: #{watts}"
    else
      puts element
    end

    newdoc
  end
end

RAVEn::StreamCLI.run(ARGV) if __FILE__ == $0
