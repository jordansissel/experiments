#include <stdio.h>
#include <unistd.h>
#include "flog.h"

#define flog_if_slow(stream, max_duration, block, format, args...) \
{ \
  struct timeval __start; \
  gettimeofday(&__start, NULL); \
  { \
    block \
  } \
  double __duration = duration(&__start); \
  if (__duration >= max_duration) { \
    flog(stream, "slow operation (%.3f seconds): " format , __duration, args); \
  } \
}

int main() {
  flog_if_slow(stdout, 0.300, {
    sleep(1);
  }, "long operation, %d/%c", 33, 'a');
  return 0;
}
