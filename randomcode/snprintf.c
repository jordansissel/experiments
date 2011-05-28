

#include <string.h>
#include <stdio.h>

int main() {
  char *foo = strdup("one two three four");

  snprintf(foo + 4, 3, "hello");

  printf("%s\n", foo);
  return 0;

}
