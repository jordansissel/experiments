#include <sys/types.h>
#include <string.h>
#include <stdio.h>
#include <stdlib.h>

int main() {
  double *foo;
  void *bar;

  foo = malloc(sizeof(double));

  *foo = 3.4;
  bar = malloc(sizeof(void *));
  memcpy(bar, &foo, sizeof(void *));

  printf("%f\n", *foo);
  printf("%f\n", **(double **)bar);

  return 0;

}
