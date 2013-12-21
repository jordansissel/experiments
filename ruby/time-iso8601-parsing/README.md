# iso8601/rfc3339/xml:dateTime parsing

Joda-Time is lovely, but many ruby things take Ruby's Time objects.

Logstash uses high-precision iso8601 timestamps.

Gotta go between the two! Quickly, if possible.

## Test Output

```
Macintosh(...ts/ruby/time-parsing-is-slow) % ruby iso8601parse.rb
Rehearsal -------------------------------------------------------------
ISODateTimeFormat+toTime1  10.490000   0.170000  10.660000 (  7.323000)
ISODateTimeFormat+toTime2   7.910000   0.110000   8.020000 (  5.727000)
forPattern+toTime1          7.640000   0.100000   7.740000 (  5.741000)
forPattern+toTime2          6.230000   0.090000   6.320000 (  4.311000)
forPatternMillis            2.230000   0.010000   2.240000 (  1.902000)
lolRuby                    54.760000   0.170000  54.930000 ( 49.988000)
--------------------------------------------------- total: 89.910000sec

                                user     system      total        real
ISODateTimeFormat+toTime1   9.400000   0.120000   9.520000 (  6.800000)
ISODateTimeFormat+toTime2   7.100000   0.080000   7.180000 (  5.264000)
forPattern+toTime1          7.050000   0.110000   7.160000 (  5.360000)
forPattern+toTime2          6.190000   0.070000   6.260000 (  4.321000)
forPatternMillis            2.010000   0.010000   2.020000 (  1.817000)
lolRuby                    45.230000   0.070000  45.300000 ( 44.788000)
```

As shown previously in other experiments, ruby's time parsing speed is abysmal.

Joda's is nice, but I found 5 ways to go parse with Joda-Time and end with a Ruby Time.

Looks like the fastest, by a wide margin, is this 'forPatternMillis' approach.

