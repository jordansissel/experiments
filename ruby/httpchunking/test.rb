#!/usr/bin/env ruby

require "net/http"
require "stringio"

a = StringIO.new

str = "hello world"
a.write(sprintf("%x", str.length))
a.write("#{str}")
a.write("0")
a.rewind

Net::HTTP.start("httpbin.org", 80) do |http|
  p http
  request = Net::HTTP::Post.new("/post")
  request["Transfer-Encoding"] = "chunked"
  request["Content-Type"] = "text/plain"
  request.body_stream = a

  response = http.request(request)
  puts response.body
end
