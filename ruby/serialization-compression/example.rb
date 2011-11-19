require "rubygems"
require "json"
require "msgpack"
require "zlib"

data = {
  "@source"      => "stdin://snapple.home/",
  "@type"        => "stdin",
  "@tags"        => [],
  "@fields"      => {},
  "@timestamp"   => "2011-11-19T23:10:30.849000Z",
  "@source_host" => "snapple.home",
  "@source_path" => "/",
  "@message"     => "hello"
}

json = data.to_json
msgpack = MessagePack.pack(data)

json_deflate = Zlib::Deflate.deflate(json, 9)
msgpack_deflate = Zlib::Deflate.deflate(msgpack, 9)
p :json => data.to_json.size
p :jsondeflate => json_deflate.size
p :msgpack => MessagePack.pack(data).size
p :msgpackdeflate => msgpack_deflate.size

