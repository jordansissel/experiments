#!/usr/bin/env ruby

require 'set'
require 'rubygems'
require 'em-http'
require 'eventmachine'

AMOUNT = 1000
EventMachine.run do
  count = 0
  http = EventMachine::HttpRequest.new("http://127.0.0.1:9200/log/stash")
  #http = EventMachine::HttpRequest.new("http://127.0.0.1/")

  start = Time.now
  entry = {
    "hello" => "world",
    "foo" => Time.now.to_i,
  }

  EventMachine.defer do 
    loop do
      req = http.post({
        :body => entry,
      })

      req.callback do |response|
        count += 1
        if count % AMOUNT == 0
          puts "pid[#{$$}] count: #{count}. Rate: #{count / (Time.now - start)}"
          #start = Time.now
        end
      end # http response callback
    end # loop
  end # EventMachine.deferrable
end # EventMachine.run
