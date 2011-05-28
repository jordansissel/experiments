#include <stdio.h>

struct foo {
  enum { lt, gt, ge, le, eq, ne } op;
};

int main() {
  struct foo a;

  a.op = gt;

  printf("%d\n", a.op);
  return 0;
}

