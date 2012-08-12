!SLIDE transition=fade
# terminology

what is a log?

.notes TODO

!SLIDE transition=fade
# Event == Log

* Timestamp
* Data

That's it.

!SLIDE transition=fade
# Log Design

* who is the target audience?
* is it structured or unstructurd?

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

!SLIDE transition=fade
# Trace Logs

* Target Audience: Domain Expert
* Structured: Unlikely.
* Often the author is the only one who can read these.

!SLIDE transition=fade
# Transaction Logs

* mysql binlog
* postgres write-ahead-log
* hadoop editlog

!SLIDE transition=fade
# Transaction Logs

* Audience: Computers
* Structured: Yes.

!SLIDE transition=fade
# Accounting Logs

* ad server click logs
* online retail checkouts
* customer logins

!SLIDE transition=fade
# Accounting Logs

* Audience: Computers and Humans
* Structured: Usually
