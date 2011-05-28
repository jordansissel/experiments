#include  <stdio.h>
#include <string.h>


int main() {
  char *foo = strdup("000F");
  int len = 4;
  int conv = 12345;

  printf("Input: %s\n", foo);
  printf("Conv1: %0*x\n", len, conv);
  //sscanf(foo, "%0*x", len, &conv);
  sscanf(foo, "%04x", &conv);
  printf("Conv: %d (%0*x)\n", conv, len, conv);

  return 0;
}
