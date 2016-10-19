package com.semicomplete;

import java.util.List;
import java.util.LinkedList;

public class Blame {
  public static Throwable get(Throwable e) {
    Throwable i;
    while ((i = e.getCause()) != null) { 
      //System.out.printf("Exception: %s caused by %s\n", e.getClass(), i.getClass());
      e = i;
    }
    return e;
  }

  /**
   * Does a Throwable's cause stack include the given type?
   *
   * Example:
   *
   *    try {
   *      ...
   *    } catch (Exception e) {
   *      if (Blame.on(e, sun.security.provider.certpath.SunCertPathBuilderException.class)) {
   *        // e or some nested e.getCause() includes an exception of this type.
   *      }
   *    }
   */
  public static boolean on(Throwable e, Class type) {
    Throwable i = e;
    if (type.isInstance(i)) {
      return true;
    }
    while ((i = i.getCause()) != null) { 
      if (type.isInstance(i)) {
        return true;
      }
    }
    return false;
  }
}
