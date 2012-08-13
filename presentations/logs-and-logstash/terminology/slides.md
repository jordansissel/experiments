!SLIDE transition=fade
# terminology

what is a log?

.notes TODO

!SLIDE transition=fade 
# Event == Log

* Timestamp
* Data

!SLIDE transition=fade 
# Types of Logs

* Trace, debug
* Transaction, replay, replication
* Accounting

Differences are usually in target audience.

!SLIDE transition=fade 
# Trace Logs

* `printf("Opening file: %s\n", file)`
* `logger.info("Error acquiring lock")`
* Stack traces
* Core dumps

!SLIDE transition=fade 
# Trace Logs

* Audience: The author talking to herself.
* Structured: Unlikely.
* Often for used debugging a system

!SLIDE transition=fade 
# Transaction Logs

* mysql binlog
* postgres write-ahead-log
* hadoop editlog
* tcpdump pcap files

!SLIDE transition=fade 
# Transaction Logs

* Audience: The software talking to itself.
* Structured: Yes.

!SLIDE transition=fade 
# Accounting Logs

* ad server click logs
* online retail checkouts
* customer logins
* unix utmp

!SLIDE transition=fade 
# Accounting Logs

* Audience: Computers and Humans
* Structured: Usually
* Often for business/monitoring purposes.

!SLIDE transition=fade 
# Types of Logs

.notes So with logs, there's usually someone writing the event and someone
consuming it. In some cases, the lines blur and it's not entirely clear whether
a log format is for accounting or transactions, but I've found it a good way
to describe logs by purpose.

* Trace: by the author, for the author to debug with
* Accounting: by product design, for business analytics
* Transaction: by technology design, for software self-consumption

Where is operations?

!SLIDE transition=fade 
# Structured vs Unstructured

* Structured: Designed for machine consumption 
* Structured: JSON, Avro, XML, protobuf, etc
* Unstructured: printf, logger.info, etc.
