# Better assert()


Assert is used like this:

    assert(i == 3);

And outputs this:

    a.out: insist.c:14: main: Assertion `i == 3' failed.

This tells where and what was violated, but it doesn't tell us why we care or
how it was violated - what was the value of 'i'?  To answer that, we'd have to:

* hope that ulimit allowed for coredumps (default on most linux distros sets 'ulimit -c 0')
* hope that we have a debuggable binary

In more modern languages and test suites, you can do fun stuff like:

    assert(conditional, "I expected foo!")

And the failed assertion will print your message. I want this in C.

Enter: insist.

## insist(condition, format, ...)

Here's the same assertion as above, but this time with a much better error message.

    insist(i == 3, "Something went wrong, wanted i == 3, got %d", i);

Output:

    Assertion failed insist.c:18 in main(), assert(i == 3): Something went wrong, wanted i == 3, got 4

This is much much better, if only because I can do printf-like things in my
assertions.


## The code:

    #define insist(conditional, args...) \
      ( \
        (conditional) ? (void)(0) : \
          fprintf(stderr, "Assertion failed %s:%d in %s(), assert(%s): ", \
                  __FILE__, __LINE__, __PRETTY_FUNCTION__, __STRING(conditional)), \
          fprintf(stderr, ## args), \
          fprintf(stderr, "\n"), \
          abort() \
      )

This may only work in gcc.
