#ifndef _XOPEN_SOURCE
#define _XOPEN_SOURCE 500
#endif /* _XOPEN_SOURCE */

#include <stdlib.h>
#include <stdio.h>
#include <string.h>
#include <strings.h>
#include <unistd.h>
#include <Imlib2.h>

#include <X11/Xlib.h>

int main() {
  Display *xdpy;
  Window root;
  Screen *screen;
  Imlib_Image image;
  Visual *visual = NULL;
  Colormap cm;
  int depth;

  if ((xdpy = XOpenDisplay(NULL)) == NULL) {
    fprintf(stderr, "Error: Can't open display\n");
    return 1;
  }

  screen = ScreenOfDisplay(xdpy, 0);
  visual = DefaultVisual(xdpy, 0);
  depth = DefaultDepth(xdpy, 0);
  cm = DefaultColormap(xdpy, 0);
  root = RootWindow(xdpy, 0);

  imlib_context_set_display(xdpy);
  imlib_context_set_visual(visual);
  imlib_context_set_colormap(cm);
  imlib_context_set_color_modifier(NULL);
  imlib_context_set_operation(IMLIB_OP_COPY);

  imlib_context_set_drawable(root);
  image = imlib_create_image_from_drawable(0, 0, 0, screen->width, screen->height, 1);
  imlib_context_set_image(image);
  Imlib_Color color;

  int x, y;
  //for (x = 0; x < screen->width; x++) {
    //for (y = 0; y < screen->height; y++) {
      //imlib_image_query_pixel(x, y, &color);
      //printf("#%02x%02x%02x\n", color.red, color.green, color.blue);
    //}
  //}

  imlib_image_set_format("png");
  imlib_save_image("/home/jls/public_html/screenshot.png");
  return 0;
}
