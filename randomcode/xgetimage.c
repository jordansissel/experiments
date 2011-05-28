#ifndef _XOPEN_SOURCE
#define _XOPEN_SOURCE 500
#endif /* _XOPEN_SOURCE */

#include <sys/select.h>
#include <stdlib.h>
#include <stdio.h>
#include <string.h>
#include <strings.h>
#include <unistd.h>
#include <regex.h>
#include <ctype.h>

#include <X11/Xlib.h>
#include <X11/Xatom.h>
#include <X11/Xresource.h>
#include <X11/Xutil.h>
#include <X11/extensions/XTest.h>
#include <X11/keysym.h>


int main() {
  Display *xdpy;
  Window root;
  XImage *image;
  Screen *screen;

  if ((xdpy = XOpenDisplay(NULL)) == NULL) {
    fprintf(stderr, "Error: Can't open display\n");
    return 1;
  }

  screen = ScreenOfDisplay(xdpy, 0);
  root = screen->root;
  image = XGetImage(xdpy, root, 0, 0, screen->width, screen->height,
                    screen->root_depth, XYPixmap);
  return 0;
}
