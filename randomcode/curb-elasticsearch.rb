#!/usr/bin/env ruby
#

require 'rubygems'
require 'curb'
require 'json'
require 'eventmachine'

EM.run do
  (1..50).each do |i|
    puts i
    data = {
      "user" => "Jordan",
      "time" => Time.now.to_i,
    }

    curl = Curl::Easy.new("http://localhost:9200/log/stash")
    curl.headers["Content-Type"] = "application/json"
    curl.post_body = data.to_json
    curl.perform
    puts "Duration: " + curl.methods.grep(/_time$/).sort.collect { |a| [a, curl.send(a)] }.join(", ")
  end
end
