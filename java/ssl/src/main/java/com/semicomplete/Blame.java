package com.semicomplete;

public class Blame {
  public static Throwable get(Throwable e) {
    Throwable i;
    while ((i = e.getCause()) != null) { 
      //System.out.printf("Exception: %s caused by %s\n", e.getClass(), i.getClass());
      e = i;
    }
    return e;
  }
}
