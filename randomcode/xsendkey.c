#define _XOPEN_SOURCE 500
#include <sys/select.h>
#include <stdlib.h>
#include <stdio.h>
#include <string.h>
#include <strings.h>
#include <unistd.h>
#include <regex.h>

#include <X11/Xlib.h>
#include <X11/Xresource.h>
#include <X11/Xutil.h>
#include <X11/extensions/XTest.h>


int main(int argc, char **argv) {
  XKeyEvent xk;
  Display *xdpy;

  if (argc < 2) {
    printf("Usage; $0 window\n");
    return 1;
  }

  if ((xdpy = XOpenDisplay(NULL)) == NULL) {
    return 1;
  }

  xk.display = xdpy;
  xk.window = atoi(argv[1]);
  xk.subwindow = None;
  xk.time = CurrentTime;
  xk.same_screen = True;
  xk.keycode = 38;
  xk.x = xk.y = xk.x_root = xk.y_root = 1;

  xk.type = KeyPress;
  XSendEvent(xk.display, xk.window, True, KeyPressMask, (XEvent *)&xk);
  XFlush(xdpy);
  xk.type = KeyRelease;
  XSendEvent(xk.display, xk.window, True, KeyPressMask, (XEvent *)&xk);
  XFlush(xdpy);

  return 0;
}
