#include <string.h>
#include <stdlib.h>

int main(int argc, char **argv) {
  const size_t size = atoi(argv[1]);
  for (int i = 0; i < 10000000; i++) {
    free(malloc(size));
  }
  return 0;
}
