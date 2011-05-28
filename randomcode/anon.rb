
require 'rubygems'
require 'eventmachine'

foo = class << Object.new < EM::FileWatch
  def file_modified
    puts "!! modified #{path}"
  end
end

EM.run do
  EM.watch_file("/var/log/messages", foo)
end
