
CLASSBASE=com/loggly/syslog

%.class: %.java
	javac -cp ../netty-3.2.4.Final.jar:. $<

$(CLASSBASE)/SyslogServer.class: $(CLASSBASE)/SyslogDecoder.class $(CLASSBASE)/SyslogEvent.class $(CLASSBASE)/Range.class $(CLASSBASE)/SyslogParserState.class

java-run: $(CLASSBASE)/SyslogServer.class
	java -cp ../netty-3.2.4.Final.jar:. com.loggly.syslog.SyslogServer 127.0.0.1 3000

ruby-run: $(CLASSBASE)/SyslogServer.class
	CLASSPATH=../netty-3.2.4.Final.jar ruby --fast syslog-server.rb 127.0.0.1 3000 

feed:
	yes "<44>May 19 18:30:17 snack jls: foo bar 32" | nc localhost 3000
