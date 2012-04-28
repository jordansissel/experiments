#include <stdio.h> /* for printf and friends */
#include <unistd.h> /* for fork, read, lseek */
#include <sys/types.h> /* for waitpid, lseek */
#include <sys/wait.h> /* for waitpid */
#include <errno.h> /* for errno */
#include <string.h> /* for strerror */
#include <stdlib.h> /* for exit, etc */
//#include <sys/select.h> /* for select */
#include <poll.h>

/* Execs the child process */
void run_child(char **argv);

int main(int argc, char **argv) {
  const char *prog = argv[0];

  if (argc <= 1) {
    printf("Usage: %s command ...\n", prog);
    printf("This runs 'command ...' forever. If it dies, it is restarted");
    exit(1);
  }

  /* loop forever */
  for (;;) { 
    pid_t child = fork();

    if (child == 0) { 
      /* We'll keep the parent's stdin/stdout/stderr */
      /* remember, argv[0] is the program name, so skip it */
      run_child(argv + 1);
      fprintf(stderr, "Child execution went quite wrong... Shouldn't get here.\n");
      return 1; /* if we get here, run_child went quite strangely */
    } else if (child == -1) {
      fprintf(stderr, "fork() failed: %s\n", strerror(errno));
      /* this will quit the main program */
      return 1;
    }

    int status = 0;
    /* TODO(sissel): Should probably check the return status of waitpid */
    waitpid(child, &status, 0);

    /* Check if stdin is closed, if so, exit, otherwise, restart the loop and
     * thus the child. I tried may ways to detect if this is closed, found only one. */

    /* A null read doesn't indicate closure of an fd :( */
    //printf("read: %d\n", (int)read(0, NULL, 0));

    /* Can't seek on stdin anyway, so lseek always fails */
    //printf("lseek: %d\n", (int)lseek(0, 0, SEEK_CUR));

    /* Writing, even empty ones, always fails to stdin */
    //printf("write: %d\n", (int)write(0, NULL, 0));

    /* select(2) also always claimed stdin was ready for reading even after it
     * had closed. */
    //fd_set rfds;
    //FD_ZERO(&rfds);
    //FD_SET(0, &rfds); /* add stdin */
    //printf("select: %d\n", select(1, &rfds, NULL, NULL, NULL));

    /* Poll however, at least on Linux, has 'revents' not include POLLIN
     * when stdin is closed. Yaay! */
    struct pollfd pollfd = { .fd = 0, .events = POLLIN };
    poll(&pollfd, 1, -1); /* Check if stdin is still alive */

    /* revents will not include 'POLLIN' when the process controlling the input
     * to stdin dies  normally (ie; exits via normal process exit).
     * revents will include 'POLLHUP' if the process controlling the input to
     * stdin dies abnormally (ie; dies via signal, SIGKILL included) */
    if (((pollfd.revents & POLLIN) == 0) || (pollfd.revents & POLLHUP)) {
      /* fd 0 (stdin) is not ready for reading, it's dead! */
      printf("upstream stdin closed.\n");
      exit(0);
    } 

    /* if we get here, start the loop again and thus the child process, etc. */
  } /* loop forever */

  fprintf(stderr, "Unreachable code reached!\n");
  return 1;
} /* main */

void run_child(char **argv) {
  execvp(argv[0], argv);
  fprintf(stderr, "execvp(%s, ...) failed: %s\n", argv[0], strerror(errno));
  exit(1); /* child exit */
} /* child */
