import org.apache.logging.log4j.Level;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.apache.logging.log4j.core.LoggerContext;


public class Foo {
  private static final org.apache.log4j.Logger logger1 = org.apache.log4j.Logger.getLogger(Foo.class);
  private static final Logger logger2 = LogManager.getLogger();

  public static void main(String[] args) {
    logger1.warn("OK");
    logger2.warn("OK");
  }
}
