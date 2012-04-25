public class Mem {
  public static void main(String[] args) {
    System.out.println("Max memory: " + (Runtime.getRuntime().maxMemory() / 1024 / 1024) + "mb");
  }
}

