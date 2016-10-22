# All RAVEn XML protocol learnings can be found here:
#   http://rainforestautomation.com/wp-content/uploads/2014/02/raven_xml_api_r127.pdf
require "rexml/parsers/streamparser"
require "rexml/document"
require "open3"
require "cabin"

require "time" # for Time#iso8601
require "elasticsearch"
require "clamp"

module RAVEn; end
class RAVEn::StreamCLI < Clamp::Command
  option "--device", "DEVICE", "Path to the serial port", :default => "/dev/ttyUSB0"
  option "--elasticsearch-url", "URL", "URL to elasticsearch", :default => "http://localhost:9200/"
  parameter "[SSH_COMMAND] ...", "A command, if any, to ssh to a remote host before running 'cu'", :attribute_name => :ssh_command

  def execute
    logger.subscribe(STDOUT)
    logger.level = :info
    stream while true
  end

  def logger
    @logger ||= Cabin::Channel.get
  end

  def stream
    queue = Queue.new
    r = Thread.new { receive(queue) while true } 
    s = Thread.new { ship(queue) while true } 
    s.join
    r.join
  end

  def ship(queue)
    es = Elasticsearch::Client.new :hosts => elasticsearch_url

    while true
      event = queue.pop
      index = Time.now.utc.strftime("logstash-whack-%Y-%m-%d")
      @logger.info("Shipping to Elasticsearch", :index => index, :body => event)
      begin
        es.index(:index => index, :type => "power", :body => event)
      rescue Faraday::ConnectionFailed => e
        @logger.warn("Shipping to Elasticsearch failed. Will retry.", :exception => e.class.name, :message => e.message)
        sleep 0.5
        retry
      end
    end
  end

  def receive(queue)
    Open3.popen3(*[*ssh_command, "cu", "-l", "/dev/ttyUSB0", "-s", "115200"]) do |stdin, stdout, stderr|
      listener = RAVEn::XML.new do |event|
        logger.info("Got RAVEn event", :event => event)
        queue << event
      end

      begin
        parser = REXML::Parsers::StreamParser.new(stdout, listener)
        parser.parse
      rescue => e
        logger.error("An error occurred while streaming", :exception => e.class.name, :message => e.message)
        stdin.close rescue nil
        stdout.close rescue nil
        stderr.close rescue nil
      end
    end
  end
end

class RAVEn::XML
  def initialize(&callback)
    newdoc
    @callback = callback
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

  #def method_missing(m, *args)
    #p :unknown => { m => args }
  #end

  def process_document(element)
    #puts element.to_s
    #now = Time.now
    #now_str = n.strftime("%Y-%m-%dT%H:%M:%S.%%03s%z") % (n.tv_usec / 1000)
    now_str = Time.now.utc.iso8601(3)
    event = { "@timestamp" => now_str }
    # Turn <foo>bar</foo> into { "foo" => "bar" }
    element.children.select { |e| e.is_a?(REXML::Element) }.each do |child|
      # Take the first-level children and text values and make them fields
      value = child.text

      # Convert hex values
      if value =~ /^0x[0-9A-Fa-f]+$/
        value = value.to_i(16)
      end

      event[child.name.downcase] = value
    end

    case element.name
    when "InstantaneousDemand"
      # Do special math to compute current demand
      demand = REXML::XPath.first(element, "/InstantaneousDemand/Demand/text()").value.to_i(16)
      multiplier = REXML::XPath.first(element, "/InstantaneousDemand/Multiplier/text()").value.to_i(16)
      divisor = REXML::XPath.first(element, "/InstantaneousDemand/Divisor/text()").value.to_i(16)

      watts = (((demand + 0.0) * multiplier) / divisor) * 1000.0
      event["watts"] = watts
    when "PriceCluster"
      price = REXML::XPath.first(element, "/PriceCluster/Price/text()").value.to_i(16)
      trailingdigits = REXML::XPath.first(element, "/PriceCluster/TrailingDigits/text()").value.to_i(16)

      event["price_dollars"] = price.to_f / (10 ** trailingdigits)
      event["tier_number"] = REXML::XPath.first(element, "/PriceCluster/Tier/text()").value.to_i(16)
      event["currency_number"] = REXML::XPath.first(element, "/PriceCluster/Currency/text()").value.to_i(16)
    end

    # Obscure unnecessary info
    event["devicemacid"] = 1
    event["metermacid"] = 1

    # Ship it.
    @callback.call(event)

    newdoc
  end
end

RAVEn::StreamCLI.run(ARGV) if __FILE__ == $0
