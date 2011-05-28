#include "user.h"


int main() {
  grok_capture gc, gc2;
  XDR xdr, dxdr;
  char *data = calloc(1, 1024);
  char *foo;
  char *bar = NULL;
  gc.name = strdup("TEST");
  gc.id = 1;
  gc.pcre_capture_number = 0;

  //gc.pattern = "\\w+";
  //gc.predicate_func_name = NULL;

  //xdr_grok_capture(&xdr, &gc);
  xdrmem_create(&xdr, data, 1024, XDR_ENCODE);
  foo = strdup("foo");
  xdr_string(&xdr, &foo, 3);

  xdrmem_create(&dxdr, data, 1024, XDR_DECODE);
  xdr_string(&dxdr, &bar, ~0);

  printf("String: '%s'\n", bar);
  return 0;
}
