#include <stdio.h>

int main() {
  int width = 15;
  int len = 5;
  const char *str = "hello there";

  printf("Word: '%0*.*s'\n", width, len, str + 3);

  return 0;

}
