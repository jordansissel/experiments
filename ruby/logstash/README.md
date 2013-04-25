# logstash in rubies

Tests:

* perf.conf: bin/logstash agent -f etc/perf.conf
* perfdots.conf: bin/logstash agent -f etc/perfdots.conf | pv -ar > /dev/null

System:

* AMD FX-8150 (8-core @ 3.6gHz); 16GB memory
* Ubuntu 12.10 x86\_64

Setup:

    # Set cpu scaling to 'performance' (default is 'ondemand')
    for i in /sys/devices/system/cpu/cpu*/cpufreq/scaling_governor; do echo "performance" | sudo tee $i; done

## ruby 1.9.3p392

ruby 1.9.3p392 (2013-02-22 revision 39386) [x86\_64-linux]

* perf.conf: 13117/sec
* perfdots.conf: 17100/sec

## ruby 2.0.0

ruby 2.0.0p0 (2013-02-24 revision 39474) [x86\_64-linux]

* perf.conf: 5457/sec
* perfdots.conf: 8180/sec

## rubinius 2.0.0.rc1

rubinius 2.0.0.rc1 (1.9.3 74955280 yyyy-mm-dd JI) [x86\_64-unknown-linux-gnu]

* perf.conf: 16518/sec
* perfdots.conf: 19100/sec

## jruby 1.7.3

jruby 1.7.3 (1.9.3p385) 2013-02-21 dac429b on OpenJDK 64-Bit Server VM 1.7.0\_15-b20 [linux-amd64]

* perf.conf: 35156/sec
* perfdots.conf: 33800/sec

### jruby more

JRUBY\_OPTS="-J-Djruby.compile.fastest=true-J-Djruby.compile.invokedynamic=true"

* perf.conf: 40136/sec
* perfdots.conf: 40800/sec
