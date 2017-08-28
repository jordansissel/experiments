public class Thing {
  static {
    System.loadLibrary("thing");
  }

  private native void thing0();

  public void thing() {
    thing0();
  }

  public Thing() { }
}
