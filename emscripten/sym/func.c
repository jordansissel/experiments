#include <stdio.h>
#include <stdarg.h>

void foo(const char *fmt, ...) {
  va_list args;
  va_start(args, fmt);
  printf("foo: ");
  vprintf(fmt, args);
  va_end(args);
}
