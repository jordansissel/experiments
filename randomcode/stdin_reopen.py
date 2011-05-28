#!/usr/bin/python

import sys
import os

stdin = os.fdopen(0)
for i in range(2):
  for line in stdin:
    print "%d: %s" % (i, line)
  print stdin.closed
