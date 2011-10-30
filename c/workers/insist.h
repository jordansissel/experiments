#ifndef _PN_INSIST_H_
#define _PN_INSIST_H_

#include <stdio.h>
#include <stdlib.h>

/* Define "insist" that behaves like assert(), only much better. */
#define insist(conditional, args...) \
  ( \
    (conditional) ? (void)(0) : ( \
      fprintf(stderr, "Assertion failed %s:%d in %s(), insist(%s): ", \
              __FILE__, __LINE__, __PRETTY_FUNCTION__, __STRING(conditional)), \
      fprintf(stderr, ## args), \
      fprintf(stderr, "\n"), \
      abort() \
    ) \
  )

/* Define "insist_return" that behaves like insist() but returns instead of
 * aborting */
#define insist_return(conditional, return_value, args...) \
  if (!(conditional)) { \
      fprintf(stderr, "Assertion failed %s:%d in %s(), insist_return(%s): ", \
              __FILE__, __LINE__, __PRETTY_FUNCTION__, __STRING(conditional)); \
      fprintf(stderr, ## args); \
      fprintf(stderr, "\n"); \
      return(return_value); \
  }
#endif /* _PN_INSIST_H_ */
