package org.logstash;
import org.logstash.ext.JrubyEventExtLibrary;
import org.logstash.Event;

public interface Plugin {
  void register();
  //void multi_filter(Event[] events);
  Event[] multi_filter(JrubyEventExtLibrary.RubyEvent[] events);
  //String config_name();
}
