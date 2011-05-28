#include <stdio.h>
#include <unistd.h>

void exponential_backoff(useconds_t *current, useconds_t maxwait) {
  usleep(*current);

  *current *= 2;
  if (*current >= maxwait) {
    *current = maxwait;
  }
} /* void exponential_backoff(useconds_t *, useconds_t) */

int main() {
  useconds_t maxwait = 5000000; /* 5 seconds */
  useconds_t current = 2000; /* Start with 2ms */

  /* abort when we get to maxwait */
  while (current < maxwait) {
    printf("Sleeping for %d\n", current);
    exponential_backoff(&current, maxwait);
  }
  return 0;
}
