package com.semicomplete;

public class Blame {
  public static Throwable get(Throwable e) {
    Throwable i;
    while ((i = e.getCause()) != null) { 
      e = i;
    }
    return e;
  }
}
