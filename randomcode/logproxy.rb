#!/usr/bin/env ruby
#

require "rubygems"
require "eventmachine-tail"

class Watcher < EventMachine::FileGlobWatch
  def initialize(glob, interval=60)
    super(glob, interval)
    @known = []
  end

  def file_found(path)
    # Look for a common prefix.
    puts "Found file: #{path}"
    @known << path
  end

  def file_deleted(path)
    puts "Lost file: #{path}"
    @known.delete(path)
  end

end

class LogProxy
  def initialize
    #EM.watch_glob("/var/log/*", Watcher);
    EM.watch_glob("/tmp/logtest/**/*", Watcher, 1);
  end
end

if $0 == __FILE__
  EM.run do
    logproxy = LogProxy.new()
  end
end
