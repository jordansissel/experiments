require "benchmark"

JODA_UTC = org.joda.time.DateTimeZone.forID("UTC")
JODA_ISO8601_PARSER = org.joda.time.format.ISODateTimeFormat.dateTimeParser
def jodaISODateTimeParser(s)
  return JODA_ISO8601_PARSER.parseDateTime(s).withZone(JODA_UTC)
end

JODA_ISO8601PATTERN_PARSER = org.joda.time.format.DateTimeFormat.forPattern("yyyy-MM-dd'T'HH:mm:ss.SSSZ")
def jodaPatternParser(s)
  return JODA_ISO8601PATTERN_PARSER.parseDateTime(s).withZone(JODA_UTC)
end

def jodaPatternParserMillis(s)
  return Time.at(JODA_ISO8601PATTERN_PARSER.parseMillis(s) / 1000.0).utc
end

def toTime1(t)
  return Time.utc(
    t.getYear, t.getMonthOfYear, t.getDayOfMonth,
    t.getHourOfDay, t.getMinuteOfHour, t.getSecondOfMinute,
    t.getMillisOfSecond * 1000
  )
end

def toTime2(t)
  return Time.at(t.getMillis / 1000.0).utc
end

require "time"
def lolRuby(s)
  return Time.parse(s).utc
end


i = 1000000
input = "2013-12-21T07:25:06.605Z"
require "insist"

insist { lolRuby(input).to_f } == toTime1(jodaISODateTimeParser(input)).to_f
insist { lolRuby(input).to_f } == toTime2(jodaISODateTimeParser(input)).to_f
insist { lolRuby(input).to_f } == toTime1(jodaPatternParser(input)).to_f
insist { lolRuby(input).to_f } == toTime2(jodaPatternParser(input)).to_f
insist { lolRuby(input).to_f } == jodaPatternParserMillis(input).to_f

Benchmark.bmbm do |r|
  r.report("ISODateTimeFormat+toTime1") { i.times { toTime1(jodaISODateTimeParser(input)) } }
  r.report("ISODateTimeFormat+toTime2"){ i.times { toTime2(jodaISODateTimeParser(input)) } }
  r.report("forPattern+toTime1"){ i.times { toTime1(jodaPatternParser(input)) } }
  r.report("forPattern+toTime2"){ i.times { toTime2(jodaPatternParser(input)) } }
  r.report("forPatternMillis"){ i.times { jodaPatternParserMillis(input) } }
  r.report("lolRuby"){ i.times { lolRuby(input) } }
end
