#include <stdio.h>

int main() {
  int a[] = { 1, 1, 1, 1, 1, 1, 1 };
  printf("Len: %lu\n", sizeof(a) / sizeof(*a));
  return 0;
}
