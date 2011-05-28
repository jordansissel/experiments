#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

int main(int argc, char **argv) {
  int count;
  if (argc != 2) {
    printf("No count given\n");
    exit(1);
  }

  int sleep = 0;
  count = atoi(argv[1]);
  int i = 0;
  for (i = 0; i < count; i ++) {
    if (sleep > 0)
      usleep(sleep);
  }

  return 0;
}
