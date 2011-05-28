require "rubygems"
require "java"
require "sinatra/base"
require "mizuno"

class Foo < Sinatra::Base
  get "/*" do
    headers "Content-Type" => "text/plain"
    body [ params.inspect, "\n", java.lang.Thread.currentThread.inspect ]
  end
end

Mizuno::HttpServer.run(Foo.new, :port => 9292)
