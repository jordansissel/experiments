package com.semicomplete;

import java.net.InetAddress;
import java.net.UnknownHostException;
import java.util.Collection;
import java.util.Arrays;

public interface Resolver {
  Collection<InetAddress> resolve(String name) throws UnknownHostException;

  Resolver SystemResolver = (String name) -> Arrays.asList(InetAddress.getAllByName(name));
}
