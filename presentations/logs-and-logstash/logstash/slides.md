!SLIDE transition=fade

![logstash](/image/logstash.png)

So how does logstash fit in?

.notes TODO

!SLIDE transition=fade incremental
# Goals

* Tooling for managing log lifecycle
* Take events.
* Massage them.
* Put them somewhere else.
* Don't be annoying.

!SLIDE transition=fade incremental
# logstash agent

inputs | filters | outputs

!SLIDE transition=fade incremental
# logstash agent

* move logs
* process logs

!SLIDE transition=fade incremental
# logstash agent - inputs

* inputs are sources of events.
* 23 input plugins today.
* files, syslog, log4j, xmpp, irc, etc
 
!SLIDE transition=fade incremental
# logstash agent - filters

* filters let you modify/drop events
* 18 filter plugins today.
* date parsing, text parsing, anonymization, etc

!SLIDE transition=fade incremental
# logstash agent - outputs

* outputs let you send events outside the agent
* 40 output plugins today.
* storage, graphing systems, monitoring systems, transportation

!SLIDE transition=fade incremental
# logstash agent - common example

* file input (log files)
* grok filter (parse structure out of plain text logs)
* elasticsearch output (for search/analytics)
* graphite output (for trending/graphing of metrics in logs)
* nagios output (for alerting on log errors)
