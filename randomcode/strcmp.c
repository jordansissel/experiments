#include <string.h>
#include <stdio.h>

int main() {

  printf("%d\n", strcmp("--foo", "--"));
  printf("%d\n", strcmp("--", "--foo"));
  printf("%d\n", strcmp("--", "--"));
  return 0;
}
