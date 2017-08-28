import java.net.URLClassLoader;
import java.lang.ClassLoader;
import java.net.URL;

public class Main {
  public static void main(String[] args) throws Exception {
    ClassLoader fooLoader = new URLClassLoader(new URL[]{new URL("file://./foo/")});
    ClassLoader barLoader = new URLClassLoader(new URL[]{new URL("file://./bar/")});

    Class<? extends Thing> fooClass = (Class<? extends Thing>) fooLoader.loadClass("Thing");
    Class<? extends Thing> barClass = (Class<? extends Thing>) barLoader.loadClass("Thing");

    Thing foo = fooClass.newInstance();
    Thing bar = barClass.newInstance();

    foo.thing();
    bar.thing();
  }
}
