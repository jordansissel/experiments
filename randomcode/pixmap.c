/* Sample code which creates a window and a pixmap.
 * It draws to the pixmap and uses XCopyArea to copy to the window.
 *
 * This the best way to do X drawing as your handling of the Expose event 
 * now becomes a trivial XCopyArea function call. Delicious.
 *
 * Compile and run:
 *   gcc -lX11 -o pixmap pixmap.c
 *   ./pixmap
 *
 * Author: Jordan Sissel
 */

#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <string.h>
#include <errno.h>
#include <sys/types.h>
#include <sys/wait.h>
#include <signal.h>

#include <X11/Xlib.h>
#include <X11/Xresource.h>
#include <X11/Xutil.h>

int main(int argc, char **argv) {
  char *pcDisplay;
  Display *dpy;
  int ret;

  if ( (pcDisplay = getenv("DISPLAY")) == NULL) {
    fprintf(stderr, "Error: DISPLAY environment variable not set\n");
    exit(1);
  }

  if ( (dpy = XOpenDisplay(pcDisplay)) == NULL) {
    fprintf(stderr, "Error: Can't open display: %s\n", pcDisplay);
    exit(1);
  }

  int width = 200;
  int height = 200;
  Window w = XCreateSimpleWindow(dpy, DefaultRootWindow(dpy), 
                                 0, 0, width, height, 0, 0L,
                                 WhitePixel(dpy, 0));
  XSelectInput(dpy, w, ExposureMask);

  Pixmap canvas = XCreatePixmap(dpy, w, width, height, DefaultDepth(dpy, 0));
  GC gc = XCreateGC(dpy, canvas, 0, NULL);

  XSetForeground(dpy, gc, BlackPixel(dpy, 0));
  XFillRectangle(dpy, canvas, gc, 0, 0, width, height);
  XSetForeground(dpy, gc, WhitePixel(dpy, 0));
  XFillRectangle(dpy, canvas, gc, 50, 50, 50, 50);

  XCopyArea(dpy, canvas, w, gc, 0, 0, width, height, 0, 0);
  XMapWindow(dpy, w);

  for (;;) {
    XEvent e;
    XNextEvent(dpy, &e);
    switch (e.type) {
      case Expose:
        /* Simply copy from our canvas to the window for the exposed area */
        XCopyArea(dpy, canvas, w, gc, e.xexpose.x, e.xexpose.y,
                  e.xexpose.width, e.xexpose.height,
                  e.xexpose.x, e.xexpose.y);
        break;
      default:
        printf("Got event %d\n", e.type);
    }
  }

  return 0;
} /* int main(...) */

