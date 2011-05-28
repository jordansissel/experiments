/* xquerytree 
 */

#include <stdio.h>
#include <X11/Xlib.h>
#include <X11/Xutil.h>

void query(Display *xdpy, int w, int level);
void indent(int level);

int main() {
  Display *xdpy;
  Window root;
  char *display_name = NULL;

  if ( (xdpy = XOpenDisplay(display_name)) == NULL) {
    fprintf(stderr, "Error: Can't open display: %s", display_name);
    exit(1);
  }

  root = XDefaultRootWindow(xdpy);
  //XGetWindowAttributes(dpy, root, &attr);

  query(xdpy, root, 1);

  return 0;
}

void indent(int level) {
  while (level-- > 0)
    printf("  ");
}

void query(Display *xdpy, int window, int level) {
  int i, j;
  Window *children, dummy;
  unsigned int nchildren;

  if (!XQueryTree(xdpy, window, &dummy, &dummy, &children, &nchildren))
    return;

  for (i = 0; i < nchildren; i++) {
    Window w = children[i];
    XWindowAttributes attr;
    XTextProperty tp;
    XClassHint classhint;
    char *name;

    XGetWindowAttributes(xdpy, w, &attr);
    XGetWMName(xdpy, w, &tp);

    if (tp.nitems > 0) {
      indent(level - 1);
      printf("+ %d (%dx%d@%d,%d) [%s]\n", w, 
             attr.x, attr.y, attr.width, attr.height,
             (attr.map_state == IsViewable ? "Visible" : "Hidden"));

      int count = 0;
      char **list = NULL;
      int ret;
      ret = XmbTextPropertyToTextList(xdpy, &tp, &list, &count);
      indent(level);
      for (j = 0; j < count; j++)
        printf("%s", list[j]);
      XFreeStringList(list);
    } else {
      //printf("(!) %s\n", tp.value);
      query(xdpy, w, level);
      continue;
    }

    if (XGetClassHint(xdpy, w, &classhint)) {
      printf("\n");
      indent(level);
      if (classhint.res_name) {
        printf("\"%s\" ", classhint.res_name);
        XFree(classhint.res_name);
      }
      if (classhint.res_class) {
        printf("\"%s\" ", classhint.res_class);
        XFree(classhint.res_class);
      }
    }
    printf("\n");

    query(xdpy, w, level+1);
  }

}
