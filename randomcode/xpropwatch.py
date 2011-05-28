#!/usr/bin/env python

import sys
import os

from Xlib import X, display, Xatom

def printchange(name, data):
  if data.property_type == Xatom.STRING:
    val = data.value
  else:
    val = " ".join(["%s" % x for x in data.value])
  print "%s %s" % (name, val)

def main(args):
  prog = args.pop(0);
  if len(args) == 0:
    print "Usage: %s <properties to watch>" % prog
    return 1

  dpy = display.Display()
  screens = dpy.screen_count()
  atoms = {}
  for name in args:
    atomid = dpy.get_atom(name, only_if_exists=True)
    if atomid != X.NONE:   # Atom found
      atoms[atomid] = name

  for num in (range(screens)):
    screen = dpy.screen(num);
    screen.root.change_attributes(event_mask=X.PropertyChangeMask)

  print "Watching for: %r" % atoms
  while True:
    ev = dpy.next_event()
    if ev.type == X.PropertyNotify:
      if (ev.atom in atoms):
        data = ev.window.get_full_property(ev.atom, 0);
        printchange(atoms[ev.atom], data);
        

if __name__ == "__main__":
  exit(main(sys.argv))
