#include <stdio.h>
#include <unistd.h>
#include "flog.h"

int main() {
  flog_if_slow(stdout, 0.300, {
    sleep(1);
  });
  return 0;
}
