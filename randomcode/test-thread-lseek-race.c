

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

#define BUFSIZE 4096

#define LOCKWRAP(code) { \
  code; \
}


static off64_t offset = 0;
static pthread_mutex_t offsetlock = PTHREAD_MUTEX_INITIALIZER;
static int fd;

void *Reader(void *data) {
  char buf[BUFSIZE];
  int bytes = 1;
  off64_t loff;

  while (bytes > 0) {
    //bytes = read(fd, buf, BUFSIZE);
    bytes = write(fd, buf, BUFSIZE);
    LOCKWRAP( 
      if (bytes > 0)
        offset += bytes;
      loff = lseek64(fd, 0, SEEK_CUR);
      if (loff != offset) {
        printf("lseek64(%ld) vs offset(%ld) => %ld\n", loff, offset, loff - offset);
      }
    );

  }

  printf("%d\n", bytes);
  perror("OK");

  pthread_exit(NULL);
}

void *Statter(void *data) {

  off64_t seekpos;
  off64_t curoffset;
  for (;;) {
    /* If you comment out this line, the Reader thread will stop
     * complaining that lseek64's result is not the same as our computed
     * offset. This is freaking weird. */
    seekpos = lseek64(fd, 0, SEEK_CUR);
    if (0) {
      LOCKWRAP( curoffset = offset );

      //if (seekpos != curoffset) {
        //printf("%ld != %ld\n", seekpos, curoffset);
      //}
    }
  }

  pthread_exit(NULL);
}

int main(int argc, char **argv) {
  pthread_t reader, statter;
  char *file = "/dev/null";

  if (argc > 1)
    file = argv[1];

  /* Open the file with O_DIRECT will also fix the lseek64 weird behavior
   */
  fd = open(file, O_WRONLY | O_CREAT);

  perror("OK");
  pthread_create(&reader, NULL, Reader, NULL);
  //pthread_create(&statter, NULL, Statter, NULL);

  pthread_join(reader, NULL);
  //pthread_join(statter, NULL);

  pthread_exit(NULL);
  return 0;
}
