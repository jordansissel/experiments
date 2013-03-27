
# Event Processing

## java -Xmx tuning

"Java takes too much memory!"

Bad defaults ^^

    public class Mem {
      public static void main(String[] args) {
        System.out.println(Runtime.getRuntime().maxMemory());
      }
    }

TODO(sissel): Include hotspot and icedtea 'maxMemory' information
* IcedTea (~25% of total physical memory)
* HotSpot (???)

## Slow inputs?

* Bottlenecked on slow code or I/O? Run more!

    input {
      amqp {
        # Use 12 threads to read from amqp
        threads => 12
        ...
      }
    }

## Slow filters?

* Filters run as a 'worker'; can run many.

    # Run 8 filter workers (default=1)
    logstash agent -w 8 -f logstash.conf

## Scale messaging (redis example)

* Run multiple INDEPENDENT redis servers.
* Tell logstash to use all the redis servers

    input {
      redis { host => "redis1" ... }
      redis { host => "redis2" ... }
      redis { host => "redis3" ... }
    }

    output {
      redis {
        # One is chosen at random and used until 
        # failure. Then we choose again.
        host => [ "redis1", "redis2", "redis3" ]
      }
    }

# Monitoring/Debugging

## Trace events with a custom field

Generate your configs to include the logstash host or other
identifiable information. Attach to events!

    input {
      redis {
        add_field => [ "logstash", "myhostname.example.com" ]
      }
    }

## Grok

  * grokdebug.herokuapp.com

## Watch the live stream

    output {
      # Connect with a websocket client, receive event stream
      websocket { ... }
    }

or

    output {
      # Connect over tcp, receive event stream
      tcp { mode => server ... }
    }

## Measure 

### metrics filter

    filter {
      metrics {
        # Count events; periodically emit rate, count, etc.
        meter => "events"
        add_tag => "throughput"
      }
    }

### statsd output

    output {
      statsd {
        # Count events using a statsd server.
        increment => "events"
      }
    }

## Debug

### top -Hp logstashpid

TODO(sissel): Include 'top' output showing thread names

### visualvm, jstack, etc

It's the jvm, so you get all the awesome jvm inspection/debug tools.

# ElasticSearch

## Multiple logstash indexers

* Many logstsah agents can write to ES simultaneously

## Monitoring ES

### TODO(sissel): Cluster metrics
### TODO(sissel): Index metrics
### TODO(sissel): Process metrics

## Index Templates

Lets you apply configuration to any new indexes matching a pattern.

    logstash-*

TODO(sissel): Include a sample template.

## Compression

Enable it.

## Curation

* delete daily indexes
* TODO(sissel): link to python script that does it


