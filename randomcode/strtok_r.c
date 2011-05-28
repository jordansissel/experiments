#include <string.h>
#include <stdio.h>

int main(int argc, char **argv) {
  char *line = strdup(argv[1]);
  char *tokctx;
  char *keyseq;

  keyseq = strtok_r(line, " ", &tokctx);

  printf("Keyseq: %s\n", keyseq);
  printf("saveptr %%p: %p\n", tokctx);
  printf("saveptr %%s: %s\n", tokctx);

  return 0;
}
