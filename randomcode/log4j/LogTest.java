import org.apache.log4j.Logger;
import org.apache.log4j.PropertyConfigurator;

public class LogTest {
  private static Logger logger = Logger.getLogger(LogTest.class);

  public static void main(String[] args) {
    //BasicConfigurator.configure();
    PropertyConfigurator.configure("log4j.properties");

    logger.info("Testing");
  } /* public static void main(String[]) */
} /* public class LogTest */
