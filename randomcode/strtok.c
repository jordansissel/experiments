#include <stdio.h>
#include <string.h>

int main() {

  char *x;
  char *strptr;
  char *tok;
  char *tokctx;
  char *last;

  x = strdup("foo+bar+baz");

  strptr=x;

  while ((tok = strtok_r(strptr, "+", &tokctx)) != NULL) {
    last = tok;
    strptr = NULL;
  }

  printf("%s\n", last);

  return 0;
}
