#include <string.h>
#include <stdio.h>

int main() {
  char *foo = "hello";
  char *bar;

  bar = strndup(foo, 5);

  printf("%.*s\n", 6, bar);
}
