!SLIDE transition=fade
# life of a log

Four main phases

!SLIDE transition=fade
# Emitting

* Application records something.
* `logger.error("mysql is busted, yo!")`

!SLIDE transition=fade
# Transport

* Ship application logs somewhere
* Possibly anonymize them in transit.
* syslog, scribe, flume, etc

!SLIDE transition=fade
# Analytics

* Search and Analysis
* Tools: Hadoop, ElasticSearch, Graphite, etc

!SLIDE transition=fade
# Storage

* HDFS, S3, Sherpa, etc.
* How much can you store?
* How much do you need to store?


