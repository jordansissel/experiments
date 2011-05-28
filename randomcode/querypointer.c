/* keycheck
 */

#include <sys/select.h>
#include <stdlib.h>
#include <stdio.h>
#include <string.h>
#include <unistd.h>
#include <X11/Xlib.h>
#include <X11/Xresource.h>
#include <X11/Xutil.h>
#include <X11/extensions/shape.h>
#include <X11/extensions/XTest.h>

static Display *xdpy;

int main() {
  char *display_name = NULL;
  
  if ( (display_name = getenv("DISPLAY")) == (void *)NULL) {
    fprintf(stderr, "Error: DISPLAY environment variable not set\n");
    exit(1);
  }

  if ((xdpy = XOpenDisplay(display_name)) == NULL) {
    fprintf(stderr, "Error: Can't open display: %s", display_name);
    exit(1);
  }

  
  Window root;
  Window dummy;
  int root_x, root_y, win_x, win_y, mask;
  root = DefaultRootWindow(xdpy);

  for (;;) {
    XQueryPointer(xdpy, root, &dummy, &dummy, &root_x, &root_y, &win_x, &win_y, &mask);
    printf("Root: %d,%d\n", root_x, root_y);
    printf("Win: %d,%d\n", win_x, win_y);
    printf("Mask: %x\n", mask);
  }

  return 0;
} 

