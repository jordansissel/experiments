#include <stdlib.h>
#include <stdio.h>
#include <string.h>

int main(int argc, char **argv) {
  long test;
  char *dummy, *tmp;
  if (argc != 2) {
    printf("Usage: %s <value>\n", argv[0]);
    return 1;
  }

  tmp = strdup(argv[1]);

  test = strtol(tmp, (char **)NULL, 0);
  printf("first: %ld\n", test);
  printf("ooo: '%s'\n", tmp);

  int l = strlen(tmp);
  tmp[l] = '5';
  tmp[l + 1] = '4';
  test = strtol(tmp, (char **)NULL, 0);
  printf("first: %ld\n", test);
  printf("ooo: '%s'\n", tmp);

  return 0;
}
