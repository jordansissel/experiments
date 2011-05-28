#include <stdlib.h>
#include <stdio.h>

int main() {
  double x;
  x = strtod("0xFF.F", NULL);

  printf("%f\n", x);
  return 0;
}
