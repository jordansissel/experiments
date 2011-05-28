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
  int dummy;
  
  if ( (display_name = getenv("DISPLAY")) == (void *)NULL) {
    fprintf(stderr, "Error: DISPLAY environment variable not set\n");
    exit(1);
  }

  if ((xdpy = XOpenDisplay(display_name)) == NULL) {
    fprintf(stderr, "Error: Can't open display: %s", display_name);
    exit(1);
  }

  if (XTestQueryExtension(xdpy, &dummy, &dummy, &dummy, &dummy) != True) {
    fprintf(stderr, "Error: No XTEST extension available on %s", display_name);
    return 1;
  }


  int key_low, key_high;
  int key_first;
  int *keysymlist;
  int symspercode;
  int i;
  XDisplayKeycodes(xdpy, &key_low, &key_high);

  for (i = key_low; i <= key_high; i++) {
    XKeyEvent ke;
    char keybuf[2];
    int keysym;
    memset(keybuf, 0, 2);
    ke.type = KeyPress;
    ke.display = xdpy;
    ke.state = 0;
    ke.keycode = i;

    XLookupString(&ke, keybuf, 1, &keysym, NULL);
    printf("%d => %s\n", i, keybuf);
  }
  
} 

