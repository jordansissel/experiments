#!/usr/bin/env python
# A tool that puts firefox to sleep when it does not have focus.
#
# Authors:
#   Luke Macken <lewk@csh.rit.edu>
#   Jordan Sissel <jls@csh.rit.edu>

import os

from signal import SIGSTOP, SIGCONT
from Xlib import X, display, Xatom

def watch(properties):
    """ A generator that yields events for a list of X properties """
    dpy = display.Display()
    screens = dpy.screen_count()
    atoms = {}
    wm_pid = dpy.get_atom('_NET_WM_PID')

    for property in properties:
        atomid = dpy.get_atom(property, only_if_exists=True)
        if atomid != X.NONE:
            atoms[atomid] = property

    for num in range(screens):
        screen = dpy.screen(num)
        screen.root.change_attributes(event_mask=X.PropertyChangeMask)

    while True:
        ev = dpy.next_event()
        if ev.type == X.PropertyNotify:
            if ev.atom in atoms:
                data = ev.window.get_full_property(ev.atom, 0)
                id = int(data.value.tolist()[0])
                window = dpy.create_resource_object('window', id)
                if window.id == 0: continue
                pid = int(window.get_full_property(wm_pid, 0).value.tolist()[0])
                yield atoms[ev.atom], window, pid, data

def tamefox():
    """ Puts firefox to sleep when it loses focus """
    alive = True
    ff_pid = None
    for property, window, pid, event in watch(['_NET_ACTIVE_WINDOW']):
        title = window.get_full_property(Xatom.WM_NAME, Xatom.STRING).value
        print title

if __name__ == '__main__':
    tamefox()
