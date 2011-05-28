/* LD_PRELOAD this, then attach with gdb and call the startlurker function.
 * It'll leave the lurker function running in a thread.
 * Detach with GDB, and we now have a way to run a thread along side other
 * programs. Fun?
 *
 * It's possible to override __libc_start_main, too, and gain similar
 * functionality, but I haven't tried it yet.
 */
#include <sys/types.h>
#include <sys/stat.h>

#include <pthread.h>
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <string.h>

static pthread_t t_lurker;
static int started = 0;

void *lurker(void *data) {
  for (;;) {
    char *x;
    printf("Lurker alive...\n");
    printf("sbrk(0): %zd", sbrk(0));
    x = malloc(4096000);
    memset(x, 1, 4096000);
    sleep(1);
  }
}


void startlurker() {
  printf("Startlurker!\n");
  if (!started) {
    printf("Startlurker2!\n");
    t_lurker = pthread_create(&t_lurker, NULL, lurker, NULL);
    started = 1;
  }
}
