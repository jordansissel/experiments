#include <string.h>
#include <stdio.h>

int main() {
  printf("%d\n", strncmp("0x24", "0x", 2));
  printf("%d\n", strncmp("0a24", "0x", 2));
}
