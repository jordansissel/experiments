# elasticsearch+logstash perf exploration

## Configuration

* [logstash.conf](https://github.com/jordansissel/experiments/tree/master/elasticsearch/perf/logstash.conf)
* [elasticsearch template](https://github.com/jordansissel/experiments/tree/master/elasticsearch/perf/template.sh) (6 shards, 0 replicas)
* logstash run: `timeout 300 java -XX:+UseParNewGC -XX:+UseConcMkSweepGC -Xss256k -jar logstash-1.1.7-monolithic.jar agent -f logstash.conf`
* elasticsearch run: `bin/elasticsearch -f`
* logstash run on same host as elasticsearch

## Data

* https://docs.google.com/spreadsheet/ccc?key=0Aq9liCTsAyzRdDBlMzJNQncxWVhucElIV19wR2NyOFE

## Results

* No ES: 15000 events/sec
* 1 node ES w/ elasticsearch:: 5265 events/sec
* 2 node ES w/ elasticsearch:: 5326 events/sec
* 1 node ES w/ elasticsearch\_http: 4446 events/sec
* 2 node ES w/ elasticsearch\_http: 4233 events/sec

## Conclusions

* 65% loss in performance with elasticsearch logstash output (vs no outputs).
* 20% loss in performance using elasticsearch\_http instead of elasticsearch
  plugin.
* No difference in performance with 2 ES nodes vs 1.

## Next steps:

* Find out why 1-to-2 ES nodes had no performance improvement.
* Improve performance of elasticsearch\_http relative to elasticsearch..
* Improve performance  elasticsearch and elasticsearch\_http  relative to null output.
