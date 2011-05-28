#include <sys/types.h>
#include <stddef.h>
#include <string.h>
#include <stdlib.h>
#include <stdio.h>

typedef void (*func_t)();
void foo() {
  printf("bar\n");
}

int main() {
  func_t x;
  func_t *y;
  x = foo;
  y = malloc(sizeof(func_t));
  memcpy(y, &x, sizeof(func_t));
  printf("%td/%td/%td\n", foo, x, *y);
  (*y)();
  return 0;
}
