require "benchmark"
require "time" # for Time#iso8601
require "insist"

# for strftime
ISO8601 = "%Y-%m-%dT%H:%M:%S%z"

# for sprintf only
ISO8601_STRFTIME = "%04d-%02d-%02dT%02d:%02d:%02d.%06d%+03d:00" 

# for a mix of strftime + sprintf
ISO8601_STRFTIME_FRACS = "%Y-%m-%dT%H:%M:%S.%%06d%z" 

def control(t); return ; end
def time_to_f(t); return t.to_f; end
def time_to_i(t); return t.to_i; end
def time_to_f_custom(t); return t.to_i + (t.tv_usec/1e6); end
def time_to_i_usec(t); return (t.to_i * 1000000) + t.tv_usec; end
def time_strftime_iso8601(t); return t.strftime(ISO8601) ; end
def time_iso8601(t); return t.iso8601 ; end
def time_iso8601_6(t); return t.iso8601(6) ; end
def time_iso8601_sprintf_eval(t)
  return t.instance_eval { ISO8601_STRFTIME % [year, month, day, hour, min, sec, tv_usec, utc_offset / 3600] }
end

def time_iso8601_sprintf(t)
  return ISO8601_STRFTIME % [t.year, t.month, t.day, t.hour, t.min, t.sec, t.tv_usec, t.utc_offset / 3600]
end

def time_sprintf_strftime(t)
  return t.strftime(ISO8601_STRFTIME_FRACS) % t.tv_usec
end

def time_sprintf_plus_strftime(t)
  return t.strftime("%Y-%m-%dT%H:%M:%S.") + ("%06d" % t.tv_usec) + t.strftime("%z")
end

def time_strftime_interp(t)
  return t.strftime("%Y-%m-%dT%H:%M:%S.#{"%06d" % t.tv_usec}%z")
end

now = Time.now
count = 1_000_000

# Verify things generate correctly.
# Permit errors introduced by IEEE float math.
insist { (time_to_f(now) - time_to_f_custom(now)).abs } < 0.00001
# Permit errors introduced by IEEE float math.
insist { ((time_to_f(now) * 1e6).to_i - time_to_i_usec(now)).abs } < 2

# verify iso8601 alternative implementations match stdlib's output, or mostly..
insist { time_iso8601_6(now) } == time_iso8601_sprintf(now)
insist { time_iso8601_6(now) } == time_iso8601_sprintf_eval(now)
insist { time_iso8601_6(now).gsub(/:00$/, "00") } == time_sprintf_strftime(now)
insist { time_iso8601_6(now).gsub(/:00$/, "00") } == time_sprintf_plus_strftime(now)
insist { time_iso8601_6(now).gsub(/:00$/, "00") } == time_strftime_interp(now)

Benchmark.bmbm(30) do |r|
  r.report("control <no op>") { count.times { control(now) } }
  r.report("Time#to_f <stdlib>") { count.times { time_to_f(now) } }
  r.report("Time#to_i <stdlib>") { count.times { time_to_i(now) } }
  r.report("Time#to_f(to_i + tv_usec)") { count.times { time_to_f_custom(now) } }
  r.report("Time#to_i(in usecs)") { count.times { time_to_i_usec(now) } }
  #r.report("strftime(#{ISO8601})") { count.times { time_strftime_iso8601(now) } }
  #r.report("strftime(sprintf)") { count.times { time_sprintf_strftime(now) } }
  #r.report("strftime+sprintf+strftime") { count.times { time_sprintf_plus_strftime(now) } }
  #r.report("strftime_interp") { count.times { time_strftime_interp(now) } }
  r.report("Time#iso8601 <stdlib>") { count.times { time_iso8601(now) } }
  r.report("Time#iso8601(6) <stdlib>") { count.times { time_iso8601_6(now) } }
  r.report("sprintf-instance_eval") { count.times { time_iso8601_sprintf_eval(now) } }
  r.report("sprintf") { count.times { time_iso8601_sprintf(now) } }
end
