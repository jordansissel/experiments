#include <X11/Xlib.h>
#include <stdio.h>
#include <xkbcommon/xkbcommon.h>
#include <X11/XKBlib.h>
#include <strings.h>

int main(int argc, char *argv[]) {
  Display *dpy = XOpenDisplay(NULL);

  XkbDescPtr desc = XkbGetMap(dpy, XkbAllClientInfoMask, XkbUseCoreKbd);

  if (argc > 1 && strcasecmp(argv[1], "xkbfreekeyboard") == 0) {
    printf("Using XkbFreeKeyboard\n");
    XkbFreeKeyboard(desc, 0, 1);
  } else {
    printf("Using XkbFreeClientMap\n");
    XkbFreeClientMap(desc, 0, 1);

    XFree(desc);
  }

  XCloseDisplay(dpy);
}
