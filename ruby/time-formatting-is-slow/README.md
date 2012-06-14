# Time sucks.

I was profiling Logstash throughput and saw lots of time being spent in time
formatting (generating an ISO8601 timestamp for events).
The specific code is here: [logstash/time.rb](https://github.com/logstash/logstash/blob/ca10d8a6352b9bf7b69a8f0a977df0aa3b01f395/lib/logstash/time.rb#L15-19)

I commented-out the time formatting, and it speeds up by like 6x. Hmm.. Need a
better way to format time, or I need to switch to another time format.

Experiment time!

## Conclusions

### For generating a nice ISO8601 string

Like this: "2012-06-14T02:34:00.693000-0700"

* Time#strftime has terrible performance compared to other solutions in JRuby 1.6.7
* Time#iso8601 has terrible performance compared to other solutions in MRI 1.9.3
* sprintf performs well under both JRuby and MRI

### For just a number

Using unix epoch, `#to_f` might be the most practical in that it is
precision-agnostic. It's also 15x faster than sprintf (the fastest iso8601
generator).

This has the unfortunate consequence that it's a schema change in the logstash
event format.

## ruby 1.9.3

```
                                     user     system      total        real
control <no op>                  0.330000   0.000000   0.330000 (  0.328099)
Time#to_f <stdlib>               3.190000   0.000000   3.190000 (  3.220451)
Time#to_i <stdlib>               0.950000   0.000000   0.950000 (  0.955067)
Time#to_f(to_i + tv_usec)        3.190000   0.000000   3.190000 (  3.227304)
Time#to_i(in usecs)              2.530000   0.000000   2.530000 (  2.554161)
strftime(%Y-%m-%dT%H:%M:%S%z)    8.540000   0.000000   8.540000 (  8.635077)
strftime(sprintf)               15.680000   0.000000  15.680000 ( 15.868209)
strftime+sprintf+strftime       19.440000   0.000000  19.440000 ( 19.660080)
strftime_interp                 14.650000   0.000000  14.650000 ( 14.811608)
Time#iso8601 <stdlib>           16.280000   0.000000  16.280000 ( 16.445850)
Time#iso8601(6) <stdlib>        22.460000   0.000000  22.460000 ( 22.669465)
sprintf-instance_eval           13.320000   0.000000  13.320000 ( 13.445673)
sprintf                         12.100000   0.000000  12.100000 ( 12.223729)
```

Observations:
* The fastest way to get a full ISO8601 with subsecond values appears to be with sprintf.
* Time#iso8601 is silly slow.
* My 'to_i in usecs' seems like a reasonable (and faster than Time#to_f!) way to get high precision on a timestamp very quickly.
* sprintf wins, 82600 calls/sec

## jruby 1.6.7 --1.9 (java 1.7.0_b147-icedtea)

```
                                    user     system      total        real
control <no op>                 0.188000   0.000000   0.188000 (  0.188000)
Time#to_f <stdlib>              0.224000   0.000000   0.224000 (  0.224000)
Time#to_i <stdlib>              0.222000   0.000000   0.222000 (  0.222000)
Time#to_f(to_i + tv_usec)       0.562000   0.000000   0.562000 (  0.562000)
Time#to_i(in usecs)             0.443000   0.000000   0.443000 (  0.443000)
strftime(%Y-%m-%dT%H:%M:%S%z)  61.678000   0.000000  61.678000 ( 61.678000)
strftime(sprintf)              76.765000   0.000000  76.765000 ( 76.765000)
strftime+sprintf+strftime     106.302000   0.000000 106.302000 (106.302000)
strftime_interp                75.480000   0.000000  75.480000 ( 75.480000)
Time#iso8601 <stdlib>           8.138000   0.000000   8.138000 (  8.138000)
Time#iso8601(6) <stdlib>       12.296000   0.000000  12.296000 ( 12.297000)
sprintf-instance_eval           9.171000   0.000000   9.171000 (  9.171000)
sprintf                         8.131000   0.000000   8.131000 (  8.131000)
```

Observations:
* Anything numerical is mega fast (to_i, to_f, even my custom implementations)
* sprintf is again the fastest way to generate an iso8601 string with microsecond precision.
* strftime in JRuby seems a bit silly speed-wise ;)
* Jruby's Time#iso8601 is *way* faster than MRI 1.9.3
* sprintf wins again, gets ~131000 calls/sec

## jruby 1.7.0.preview1 

Notes: I skipped the strftime tests because, well, yeah they're taking 60+ seconds each.

```

                                     user     system      total        real
control <no op>                  0.150000   0.000000   0.150000 (  0.147000)
Time#to_f <stdlib>               0.310000   0.000000   0.310000 (  0.230000)
Time#to_i <stdlib>               0.260000   0.000000   0.260000 (  0.218000)
Time#to_f(to_i + tv_usec)        0.590000   0.000000   0.590000 (  0.542000)
Time#to_i(in usecs)              0.560000   0.010000   0.570000 (  0.440000)
Time#iso8601 <stdlib>            4.650000   0.010000   4.660000 (  4.658000)
Time#iso8601(6) <stdlib>         9.190000   0.010000   9.200000 (  9.188000)
sprintf-instance_eval            5.180000   0.010000   5.190000 (  5.184000)
sprintf                          4.610000   0.010000   4.620000 (  4.612000)
```

Observations:

* Many things doubled in speed from 1.6.7 to 1.7.0.preview1
* sprintf wins again, gets ~215000 calls/sec
