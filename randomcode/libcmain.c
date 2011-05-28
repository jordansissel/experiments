/* for lseek64 */
#define _LARGEFILE64_SOURCE

/* for O_DIRECT */
#define _GNU_SOURCE

#include <sys/types.h>
#include <sys/stat.h>
#include <assert.h>

#include <pthread.h>
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <fcntl.h>
#include <string.h>
#include <errno.h>

#include <dlfcn.h>

void *lurker(void *data) {
  for (;;) {
    sleep(1);
    printf("Lurker alive...\n");
  }
}

static pthread_t t_lurker;
int ok() {
  return pthread_create(&t_lurker, NULL, lurker, NULL);
}

int main(int argc, char **argv) {
  for (;;) {
    printf("sleeping main...\n");
    sleep(5);
  }
  return 0;
}
