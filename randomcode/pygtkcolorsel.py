#!/usr/bin/env python

import gtk
import gtk.gdk

def color_change(widget):
  color = widget.get_current_color()
  #print sorted(dir(color))
  #print color.to_string()
  print "#%02x%02x%02x" % (color.red >> 8, color.green >> 8, color.blue >> 8)

win = gtk.Window(gtk.WINDOW_TOPLEVEL)
csel = gtk.ColorSelection()
win.add(csel)
csel.show()
win.show()

csel.connect("color-changed", color_change)
win.connect("destroy", lambda *args: exit(0))
gtk.main()

