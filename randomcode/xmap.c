/* xmap
 */

#include <stdlib.h>
#include <stdio.h>
#include <unistd.h>
#include <X11/Xlib.h>
#include <X11/Xresource.h>
#include <X11/Xutil.h>
#include <X11/extensions/shape.h>
#include <X11/extensions/XTest.h>

int main(int argc, char **argv) {
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

  if (argc != 2) {
    printf("usage: %s window_id\n", *argv);
    return 1;
  }

  argv++;

  int window;
  int ret;
  XClientMessageEvent ce;
  Atom restack;

  window = (int)strtol(*argv, NULL, 0);
  restack = XInternAtom(xdpy, "_NET_RESTACK_WINDOW.", False);

  //printf("IMPROTO: %d\n", XInternAtom(xdpy, "WM_PROTOCOLS", False));
  //printf("TAKE: %d\n", takefocus);
  ce.type=ClientMessage;
  ce.display=xdpy;
  ce.window=window;
  ce.message_type = restack;
  ce.format=32;
  ce.data.l[0] = 2;
  ce.data.l[1] = None;
  ce.data.l[2] = Above;
  ce.data.l[3] = 0;
  ce.data.l[4] = 0;
  ret = XSendEvent(xdpy, XDefaultRootWindow(xdpy), 
                   False, 
                   SubstructureRedirectMask | SubstructureNotifyMask,
                   (XEvent *) &ce);
  XSync(xdpy, False);


  /* Focus the window */
  //ret = XSetInputFocus(xdpy, window, RevertToParent, CurrentTime);
  //printf("setinput xmap: id:%d / ret:%d\n", window, ret);

  /* Raise it */
  //XWindowChanges wc;
  //wc.x = 200;
  //wc.y = 150;
  //wc.sibling = (unsigned long)-1;
  //wc.stack_mode = Below;
//
  //ret = XConfigureWindow(xdpy, window, CWStackMode | CWX | CWY, &wc);
  //printf("configure xmap: id:%d / ret:%d\n", window, ret);
  //XFlush(xdpy);

  return 0;
}

