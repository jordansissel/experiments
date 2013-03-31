require "uri"
require "addressable/uri"

uri_re = /^([A-z+-]+):\/\/([^A-z0-9_.]+)(?::[0-9]+)?(\/.*)/

url = "lumberjack://foobar/var/log/messages"

def time(iterations,&block)
  start = Time.now
  iterations.times do
    block.call
  end
  return Time.now - start
end

iterations = 1000000
2.times do
  p "URI.parse" => time(iterations) { URI.parse(url) }
  p "Addressable::URI.parse" => time(iterations) { Addressable::URI.parse(url) }
  p "regexp" => time(iterations) { uri_re.match(url) }
end

