
class JNIHelperExample {
  private native void abort(); /* See JNIHelperExample.c */

  public static void main(String[] args) {
    JNIHelperExample helper = new JNIHelperExample();
    System.out.println("Hello!");
    helper.abort();
    System.out.println("World");
  }

  static {
    System.loadLibrary("JNIHelperExample");
  }
}
