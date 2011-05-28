#include <stdio.h>
int main() {
  printf("%.*s", 3, "\x00\x01\x02");
  return 0;
}
