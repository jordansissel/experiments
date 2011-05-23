
class Time 
  @@re_cache = {}
  @@re_formats = {
    "%b" => "(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)",
    "%d" => "[ 1-3]?[0-9]",
    "%H" => "[0-9]{2}",
    "%M" => "[0-9]{2}",
    "%S" => "[0-9]{2}",
  }

  def self.my_strptime(string, format)
    if @@re_cache.include?(format)
      obj = @@re_cache[format]
    else
      captures = []
      pattern = format.gsub(/%[A-z]/) do |spec|
        if @@re_formats.include?(spec)
          captures << spec
          "(#{@@re_formats[spec]})"
        else
          spec
        end
      end
      re = Regexp.new(pattern)
      obj = @@re_cache[format] = {
        :re => re,
        :captures => captures,
      }
    end

    m = obj[:re].match(string)
    return nil if !m

    now = Time.new
    time_array = [now.year, now.month, now.day, 0, 0, 0, 0]
    obj[:captures].each_with_index do |spec, i|
      #p spec => m[i + 1]
      case spec
        when "%y"; time_array[0] = m[i + 1]
        when "%b"; time_array[1] = m[i + 1]
        when "%d"; time_array[2] = m[i + 1]
        when "%H"; time_array[3] = m[i + 1]
        when "%M"; time_array[4] = m[i + 1]
        when "%S"; time_array[5] = m[i + 1]
      end # case spec
    end # each capture

    return Time.local(*time_array)
  end # def strptime
end # class Time

require "rubygems"
require "time"

case ARGV[0]
when "native"
  require "time" # stdlib/core provides Time.strptime
  require "date"
when "home_run"
  require "home_run"
when "mine"
  class Time
    class << self
      alias_method :strptime, :my_strptime
    end
  end
end

start = Time.now
iterations = 200000
#iterations = 10000
1.upto(iterations).each do |i|
  #DateTime.strptime("May 19 21:56:06", "%b %d %H:%M:%S")
  Time.strptime("May 19 21:56:06", "%b %d %H:%M:%S")
end
duration = Time.now - start
rate = iterations / duration

printf("%15.15s | %5s/%7s | %8.2f | %6d\n", ARGV[0], RUBY_ENGINE, RUBY_VERSION, duration, rate)
