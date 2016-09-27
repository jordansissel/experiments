package org.logstash.filters;
import org.logstash.Event;
import org.logstash.ext.JrubyEventExtLibrary;
import org.logstash.Plugin;
import java.util.Map;

public class Java implements Plugin {
  public Java(Map args) {
    // nothing
  }

  public static String config_name() {
    return "java";
  }

  public void register() { 
    // Nothing
  }

  public Event[] multi_filter(JrubyEventExtLibrary.RubyEvent[] events) {
    System.out.println("Filtering...");
    for (JrubyEventExtLibrary.RubyEvent re : events) {
      Event e = re.getEvent();
      e.setField("java", "WOOHOO");
    }

    return new Event[]{};
  }
}
