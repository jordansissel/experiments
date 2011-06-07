# Syslog Server use case

Goal: maximize message parsing rate

## Results

Pure-java + Netty dominates. All implementations used netty. Tests were run on my thinkpad x201 laptop (i5, 2.4gHz)

Because netty lets us use multiple threads (one per connection/worker), the
'rate' scales per cpu.

    implementation   | rate (events/sec) | footprint (resident memory)
         pure java   | 375000            | 81mb
       java + jruby  | 155000            | 265mb
         pure jruby  | slow.             | ---

The bulk energy spent in the code is parsing of syslog messages.

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
