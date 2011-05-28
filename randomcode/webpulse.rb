#!/usr/bin/env ruby
#
require 'date'

def getval(str)
  return str.gsub(/<[^>]+>/, "").strip
end

class Aggregate
  def initialize
    @value = 0.0
    @count = 0
  end

  def +(val)
    @value += val
    @count += 1
    return self
  end

  def mean
    return @value / @count
  end
end

time_start = DateTime.parse("09/07/2009 09:00", "%m/%d/%Y %H:%M")
time_end = DateTime.parse("09/07/2009 11:00", "%m/%d/%Y %H:%M")

results = Hash.new { |h,k| h[k] = Aggregate.new }
curloc = label = curdate = url = nil
count = 0
itemsum = 0
data = File.open("/tmp/xmldata").each do |line|
  line.chomp!
  count += 1
  if count % 10000 == 0
    $stderr.puts count
  end

  case line
  when /<label>/
    label = getval(line)
  when /<location>/
    #break if curloc
    curloc = getval(line)
  when /<date>/
    curdate = DateTime.parse(line, "%m/%d/%Y %H:%M")
  when /<eURL>/
    url = getval(line)
    itemsum = 0
  when /e(Response|DNS|Connect|Redirect|FirstByte|LastByte)Time/
    next if url !~ /^http:\/\/a.rfihub.com/
    inrange = (time_start <= curdate and time_end >= curdate)
    next if !inrange
    type = line.gsub(/>.*$/, "").gsub(/^.*</, "")
    key = [curloc, type]
    if results[key] == nil
      results[key] = Aggregate.new
    end
    v = getval(line).to_f
    results[key] = results[key] + v
    itemsum += v
    if type =~ /LastByte/ and itemsum > 1
      p [itemsum, label, curloc, curdate.ctime, url]
    end
  
  end
end

area = 
results.each do |key, val|
  location, type = key
  area[location] += val.mean
  #puts "#{key.join(" / ")}: #{val.mean}"
end

area.each do |key, val|
  puts "Latency Average #{key}: #{val}"
end
