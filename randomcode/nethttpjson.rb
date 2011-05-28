#!/usr/bin/env ruby

require 'rubygems'
require 'net/http'
require 'json'

data = {
  "foo" => "bar",
  "number" => 1,
}

req = Net::HTTP::Post.new("/test/two", initheader = {'Content-Type' =>'application/json'})
req.body = data.to_json
response = Net::HTTP.new("localhost", 9200).start {|http| http.request(req) }
puts "Response #{response.code} #{response.message}:"
puts response.body
