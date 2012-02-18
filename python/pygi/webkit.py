from gi.repository import GLib, GObject, Pango, Gtk, WebKit
import re
import time
import sys

window = Gtk.Window()
window.connect('destroy', lambda w: Gtk.main_quit())
window.set_default_size(450, 550)
window.realize()

print window.get_window()
#raise SystemExit

wk = WebKit.WebView()
window.add(wk)
window.show_all()
wk.load_string("<b>Hello</b>", "text/html", "utf-8", '#')
print ", ".join(sorted(dir(window.get_window())))
for x in sorted(dir(window.get_window())):
  if not re.compile("^get_").match(x):
    continue
  if x == "get_user_data":
    continue
  try:
    print "%s: %r" % (x, getattr(window.get_window(), x)())
  except:
    pass

#print window.get_window()
window.get_window().set_override_redirect(True)
Gtk.main()

