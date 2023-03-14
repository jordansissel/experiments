/*
 * Compile with:
 *   gcc -Wall -Werror $(pkg-config --cflags --libs x11 xkbcommon xtst) -o keycheck ./keycheck.c
 *
 * Run:
 *   ./keycheck
 *
 * This will print out the keycode for the '-' (minus) key according to X11.
 *
 * Related: https://github.com/jordansissel/xdotool/issues/414
 */

#include <X11/Xlib.h>
#include <X11/XKBlib.h>
#include <X11/keysym.h>
#include <X11/extensions/XTest.h>

#include <stdio.h> // for printf
#include <stdlib.h> // for getenv
#include <unistd.h> // for usleep

int main() {
  Display *dpy = XOpenDisplay(getenv("DISPLAY"));
  int low, high, syms_per_code;

  XDisplayKeycodes(dpy, &low, &high);
  KeySym *keysyms = XGetKeyboardMapping(dpy, low, high - low + 1, &syms_per_code);
  for (int i = low; i <= high; i++) {
    for (int g = 0; g < syms_per_code; g++) {
      KeySym sym = keysyms[(i - low) * syms_per_code + g];
      // TODO: Handle different modifier groups.
      if (sym == XK_minus && g == 0) {
        printf("XGetKeyboardMapping says XK_minus is code %d entry %d\n", i, g);

        // send the key down+up
        printf("Sending keystroke (down + up) for code %d (keysym %s)\n", i, XKeysymToString(sym));
        XTestFakeKeyEvent(dpy, i, 1, CurrentTime);
        usleep(250 * 1000); // Short sleep
        XTestFakeKeyEvent(dpy, i, 0, CurrentTime);
      }
    }
  }
  XFree(keysyms);

  XFlush(dpy);
}
