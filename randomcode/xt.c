/* xlib (X11) keypress example
 */

#include <stdlib.h>
#include <stdio.h>
#include <unistd.h>
#include <X11/Xlib.h>
#include <X11/Xresource.h>
#include <X11/Xutil.h>
#include <X11/extensions/shape.h>
#include <X11/extensions/XTest.h>

int main() {
  Display *xdpy;
  Window root;
  char *display_name = NULL;
  int ver;
  
  if ( (display_name = getenv("DISPLAY")) == (void *)NULL) {
    fprintf(stderr, "Error: DISPLAY environment variable not set\n");
    exit(1);
  }

  printf("Display: %s\n", display_name);

  if ( (xdpy = XOpenDisplay(display_name)) == NULL) {
    fprintf(stderr, "Error: Can't open display: %s", display_name);
    exit(1);
  }

  XEvent e;
  root = XDefaultRootWindow(xdpy);
  XSelectInput(xdpy, root, KeyPressMask);

  while (1) {
    XNextEvent(xdpy, &e);
    switch (e.type) {
      case KeyPress:
        printf("key\n");
        break;
    }
  }

}

