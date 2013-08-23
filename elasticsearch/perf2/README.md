
# Perf testing ES, round 2.

Environment:

* 5 nodes elasticsearch cluster
* 2 x Xeon E5620 (4-core @ 2.4gHz w/ HT enabled)
* 16 GB ram
* 4 x 1TB disks in RAID0 (\*)

(\*) RAID0 is not a good choice for this system, but disk throughput did not appear to be a bottleneck.

Target: 100K events/sec

## Tools + Configuration

[esburn.sh] - a script I run on each node to run logstash agents with a
generator + elasticsearch http output.

[elasticsearch.yml.erb] - the elasticsearch config template

[template.sh] - the template I use

Crappy script to check indexing rates:

    SECONDS=60; echo $(( $(curl -sg "http://elasticsearch:9200/logstash-$(date +%Y.%m.%d)/_count?q=@timestamp:[$(date -d "$SECONDS seconds ago 30 seconds ago" +%Y-%m-%dT%H:%M:%S%z)+TO+$(date -d '10 seconds ago' +%Y-%m-%dT%H:%M:%S%z)]" | fex ,/count/:-1) / $SECONDS. ))

Crappy script to continuously compute indexing rate:

    ruby ~/projects/experiments/ruby/start-time/linetime.rb sh -c 'while true; do curl -sg "http://elasticsearch:9200/logstash-$(date +%Y.%m.%d)/_count" | fex ,/count/:-1; sleep 10; done' |awk 'v > 0 { print ($2 - v) / ($1 - t)  } { t = $1; v = $2; }'


## Results

* Peak measured event rate: 88412 events/sec (average over 60 seconds)

## Further thoughts

My cluster normally has 7 nodes, so I am confident once the cluster is healthy (2 machines are down for repairs) I can achieve more than 100k events/sec with logstash and elasticsearch.

I'm still working on improving performance through tuning ElasticSearch as well as improving logstash's speed with code changes and tunables.
