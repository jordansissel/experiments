# Syslog Server use case

Goals:

* maximize message parsing rate

## Results

Pure-java + Netty dominates. All implementations used netty. Tests were run on
my thinkpad x201 laptop (i5, 2.4gHz)

Because netty lets us use multiple threads (one per connection/worker), the
'rate' scales per cpu.

These results are from the output of the program itself: 

    implementation   | rate (events/sec) | footprint (resident memory)
         pure java   | 375000            | 81mb
       java + jruby  | 185000            | 265mb
         pure jruby  | slow.             | ---

Using syslog-ng's loggen tool also confirms these results: 

    % loggen -r 500000 -iS -s 120 -I 50  localhost 3000

    implementation   | loggen output
         pure java   | average rate = 367747.47 msg/sec, count=18387440, time=50.001, msg size=120, bandwidth=43095.41 kB/sec
       java + jruby  | average rate = 190592.18 msg/sec, count=9529638, time=50.001, msg size=120, bandwidth=22335.02 kB/sec

The bulk energy spent in the code is parsing of syslog
messages.

## Implementation information

"pure java" is using netty and writing a custom ReplayDecoder (SyslogDecoder)
to emit syslog messages in the Netty pipeline.

"java + jruby" is using netty and sets up the pipeline from jruby, but uses the
SyslogDecoder implemented in Java.

"pure jruby" was implementing SyslogDecoder in pure JRuby while still using
Netty.

## Conclusion

This particular project at loggly needs to parse syslog messages and ship them
elsewhere. It also needs to provide inspectability and an internal API so our
systems can tell this service about changes to syslog inputs.

To that end, I'm going to keep the syslog parsing pipeline in pure java and run
it in a thread from JRuby so I can still use Sinatra, haml, etc.
