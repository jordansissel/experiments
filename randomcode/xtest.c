/* Random XTEST fiddling.
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

  if (XTestQueryExtension(xdpy, &ver, &ver, &ver, &ver) != True) {
    printf("No xtest :(\n");
    return 1;
  }

  {
    int control, alt, key_l, key_two, del;
    control = XKeysymToKeycode(xdpy, XStringToKeysym("Control_L"));
    alt = XKeysymToKeycode(xdpy, XStringToKeysym("Alt_L"));
    key_l = XKeysymToKeycode(xdpy, XStringToKeysym("L"));
    key_two = XKeysymToKeycode(xdpy, XStringToKeysym("2"));
    del = XKeysymToKeycode(xdpy, XStringToKeysym("BackSpace"));

    printf("%d %d %d %d\n", control, alt, key_l, key_two);

    return;
    XTestFakeKeyEvent(xdpy, alt, True, CurrentTime);
    XTestFakeKeyEvent(xdpy, key_two, True, CurrentTime);
    XTestFakeKeyEvent(xdpy, key_two, False, CurrentTime);
    XTestFakeKeyEvent(xdpy, alt, False, CurrentTime);

    XTestFakeKeyEvent(xdpy, control, True, 100);
    XTestFakeKeyEvent(xdpy, key_l, True, CurrentTime);
    XTestFakeKeyEvent(xdpy, key_l, False, CurrentTime);
    XTestFakeKeyEvent(xdpy, control, False, CurrentTime);

    XTestFakeMotionEvent(xdpy, 0, 50, 55, CurrentTime);
    //XTestFakeButtonEvent(xdpy, 1, True, CurrentTime);
    //XTestFakeButtonEvent(xdpy, 1, False, CurrentTime);
    XTestFakeKeyEvent(xdpy, del, True, 50);
    XTestFakeKeyEvent(xdpy, del, False, CurrentTime);
    XTestFakeButtonEvent(xdpy, 2, True, CurrentTime);
    XTestFakeButtonEvent(xdpy, 2, False, CurrentTime);
    XFlush(xdpy);
  }

  return 0;
}

