package com.semicomplete;

import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.Collection;
import java.util.Arrays;

public interface Resolver {
  public Collection<InetAddress> resolve(String name) throws UnknownHostException;

  public static final Resolver SystemResolver = (String name) -> Arrays.asList(InetAddress.getAllByName(name));
}
