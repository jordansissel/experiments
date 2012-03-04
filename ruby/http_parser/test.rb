require "rubygems"
require "http/parser"
require "minitest/autorun"
require "minitest/spec"

CRLF = "\r\n"
describe HTTP::Parser do

  def assert_parse(request)
    parser = HTTP::Parser.new
    parser.on_headers_complete = proc { :stop }
    offset = (parser << request)
    # offset should be at the end of the request headers, now.
    if request.length != offset
      puts "OFFSET WRONG? Data remaining: #{request[offset .. -1].inspect}"
    end
    assert_equal(request.length, offset)
  end

  def buildrequest(array)
    return array.map { |line| "#{line}#{CRLF}" }.join("")
  end

  it "should report the correct offset after reading headers" do
    request = buildrequest([
      "GET /foo HTTP/1.1",
      "host: localhost",
      ""
    ])

    assert_parse(request)
  end

  it "should report the correct offset after reading headers, also" do
    request = buildrequest([
      "GET /websocket HTTP/1.1",
      "host: localhost",
      "connection: Upgrade",
      "upgrade: websocket",
      "sec-websocket-key: SD6/hpYbKjQ6Sown7pBbWQ==",
      "sec-websocket-version: 13",
      ""
    ])

    assert_parse(request)
  end
end
