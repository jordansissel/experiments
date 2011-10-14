#include <stdio.h>
#include <stdlib.h>
#include "insist.h"

int main() {
  int i = 4;
  insist(i == 3, "Something went wrong, wanted i == 3, got %d", i);
  return 0;
}

