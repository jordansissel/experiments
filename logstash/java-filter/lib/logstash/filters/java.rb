# encoding: utf-8
require "logstash/filters/base"
require "logstash/namespace"
require "logstash-filter-java.jar"

LogStash::Filters::Java = org.logstash.filters.Java
LogStash::Registry.instance.register("logstash/filters/java", LogStash::Filters::Java)

class LogStash::Filters::Java 
  attr_accessor :metric

  def threadsafe?
    true
  end
end
