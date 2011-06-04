#include <stdio.h>
#include <stdlib.h>

/* Define "insist" that behaves like assert(), only much better. */
#define insist(conditional, args...) \
  ( \
    (conditional) ? (void)(0) : \
      fprintf(stderr, "Assertion failed %s:%d in %s(), assert(%s): ", \
              __FILE__, __LINE__, __PRETTY_FUNCTION__, __STRING(conditional)), \
      fprintf(stderr, ## args), \
      fprintf(stderr, "\n"), \
      abort() \
  )


int main() {
  int i = 4;
  insist(i == 3, "Something went wrong, wanted i == 3, got %d", i);
  return 0;
}

