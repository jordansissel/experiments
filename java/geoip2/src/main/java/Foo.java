import java.net.InetAddress;
import com.maxmind.geoip2.DatabaseReader;
import com.maxmind.geoip2.model.CityResponse;
import com.maxmind.geoip2.record.Country;
import com.maxmind.geoip2.record.Subdivision;
import com.maxmind.geoip2.record.City;
import com.maxmind.geoip2.record.Postal;
import com.maxmind.geoip2.record.Location;
import com.maxmind.db.CHMCache;
import java.io.File;

public class Foo {
  public static void main(String[] args) {
    System.out.println("Starting...");

    File f = new File("../../../logstash-filter-geoip/vendor/GeoLite2-City.mmdb");
    try {
      DatabaseReader db = new DatabaseReader.Builder(f).withCache(new CHMCache(10)).build();
      InetAddress addr = InetAddress.getByName("192.168.1.1");
      db.city(addr);
    } catch (Exception e) {
      System.err.println("Exception: " + e.getClass());
      System.err.println(e);
    }
  }
}
