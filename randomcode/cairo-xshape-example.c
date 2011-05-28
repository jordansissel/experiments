/* compile with:
 * gcc $(pkg-config xext x11 cairo-xlib-xrender --cflags --libs) cairo-xshape-example.c
 */

#include <cairo-xlib.h>
#include <X11/Xlib.h>
#include <X11/Xutil.h>
#include <stdio.h>
#include <X11/extensions/shape.h>


static cairo_surface_t *surface;
static cairo_t *cairo;
static Display *dpy;

static cairo_surface_t *shape_surface;
static cairo_t *shape_cairo;
static Pixmap shape;

void paint(Window w) {
  cairo_set_source_rgb(cairo, 0, 0, 0);
  cairo_rectangle(cairo, 0, 0, 200, 200);
  cairo_fill(cairo);

  cairo_set_line_width(cairo, 1);
  cairo_set_source_rgb(cairo, 255, 255, 0);
  cairo_rectangle(cairo, 20, 20, 50, 50);
  cairo_rectangle(cairo, 80, 80, 50, 50);
  cairo_stroke(cairo);

  cairo_text_extents_t textext;
  cairo_select_font_face(cairo, "Courier", CAIRO_FONT_SLANT_NORMAL, CAIRO_FONT_WEIGHT_BOLD);
  cairo_set_font_size (cairo, 15);
  cairo_text_extents (cairo, "a", &textext);

  cairo_move_to(cairo, textext.width - textext.x_bearing, textext.height - textext.y_bearing);
  cairo_show_text(cairo, "Hello");
}

void shapeit(Window w) {
  /* Shape it */

  /* Since the shape_surface is a 1bit image, we'll use
   * cairo_set_operator instead of cairo_set_source_rgb. Bit values are:
   * CAIRO_OPERATOR_CLEAR means off
   * CAIRO_OPERATOR_OVER means on
   */
  cairo_set_operator(shape_cairo, CAIRO_OPERATOR_CLEAR);
  cairo_rectangle(shape_cairo, 0, 0, 200, 200);
  cairo_fill(shape_cairo);

  cairo_set_line_width(shape_cairo, 1);
  cairo_set_operator(shape_cairo, CAIRO_OPERATOR_OVER);
  cairo_rectangle(shape_cairo, 20, 20, 50, 50);
  cairo_rectangle(shape_cairo, 80, 80, 50, 50);
  cairo_stroke(shape_cairo);

  cairo_text_extents_t textext;
  cairo_select_font_face(shape_cairo, "Courier", CAIRO_FONT_SLANT_NORMAL,
                         CAIRO_FONT_WEIGHT_BOLD);
  cairo_set_font_size(shape_cairo, 15);
  cairo_text_extents(shape_cairo, "a", &textext);

  cairo_move_to(shape_cairo, textext.width - textext.x_bearing, textext.height - textext.y_bearing);
  cairo_show_text(shape_cairo, "Hello");
  XShapeCombineMask(dpy, w, ShapeBounding, 0, 0, 
                    cairo_xlib_surface_get_drawable(shape_surface), ShapeSet);
}

int main() {
  dpy = XOpenDisplay(NULL);
  if (dpy == NULL) {
    fprintf(stderr, "Error: Can't open display. Is DISPLAY set?\n");
    return 1;
  }

  Window w;
  w = XCreateSimpleWindow(dpy, RootWindow(dpy, 0),
                          300, 200, 200, 200, 0, 0, BlackPixel(dpy, 0));
  XSetWindowAttributes winattr;
  winattr.override_redirect = 1;
  XChangeWindowAttributes(dpy, w, CWOverrideRedirect, &winattr);

  XSelectInput(dpy, w, StructureNotifyMask | ExposureMask);
  XMapWindow(dpy, w);

  surface = cairo_xlib_surface_create(dpy, w, DefaultVisual(dpy, 0), 200, 200);
  cairo = cairo_create(surface);

  shape = XCreatePixmap(dpy, w, 200, 200, 1);
  shape_surface = cairo_xlib_surface_create_for_bitmap(dpy, shape, 
                                                       DefaultScreenOfDisplay(dpy),
                                                       200, 200);
  printf("cairodepth: %d\n", cairo_xlib_surface_get_depth(shape_surface));
  shape_cairo = cairo_create(shape_surface);

  while (1) {
    XEvent e;
    XNextEvent(dpy, &e);
    printf("Got event: %d\n", e.type);

    switch (e.type) {
      case MapNotify:
      case ConfigureNotify:
      case Expose:
        paint(w);
        shapeit(w);
        break;
    }
  }

  return 0;
}
