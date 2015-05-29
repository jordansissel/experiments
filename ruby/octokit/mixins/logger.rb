require "cabin"

module Mixin
  module Logger
    def self.included(klass)
      # Add --debug and --log flags if our mixin target is a Clamp::Command
      if Kernel.const_defined?(:Clamp) && klass.ancestors.include?(Clamp::Command)
        klass.instance_eval do
          option "--debug", :flag, "Enable extra debug logging"
          option "--log", "LOG_FILE", "Write logs to the given file"
        end
      end
    end

    def logger
      return @logger if @logger
      @logger = Cabin::Channel.get
      if log.nil?
        @logger.subscribe(STDOUT)
      else
        @logger.subscribe(File.new(log, "a+"))
      end
      @logger.level = debug? ? :debug : :info
      @logger
    end
  end
end
