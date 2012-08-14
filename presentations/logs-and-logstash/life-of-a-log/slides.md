!SLIDE transition=fade
# life of a log

emit | transport | analyze | store

!SLIDE transition=fade
# Emitting

* Application records something.
* `logger.error("mysql is busted, yo!")`

!SLIDE transition=fade
# Transport

* Ship application logs somewhere
* Possibly anonymize them in transit.
* logstash, syslog, scribe, flume, etc

!SLIDE transition=fade
# Analytics

* Search and Analysis
* Tools: logstash, graylog2, Hadoop, ELSA, ElasticSearch, Graphite

!SLIDE transition=fade
# Storage

* HDFS, S3, Sherpa, etc.
* How much can you store?
* How much do you need to store?
* What's your retention policy?


