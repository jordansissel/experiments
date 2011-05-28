#include <sys/types.h>
#include <sys/stat.h>
#include <sys/queue.h>
#include <unistd.h>
#include <sys/time.h>
#include <fcntl.h>
#include <stdlib.h>
#include <stdio.h>
#include <string.h>
#include <errno.h>

#include <event.h>

void bufread(struct bufferevent *bev, void *data) {
  char *line;
  while ( (line = evbuffer_readline(bev->input)) != NULL ) {
    printf("Line: '%s'\n", line);
    free(line);
  }
}

void looptail() {
  int pid;
  int status;

  do {
    pid = fork();
    if (pid == 0) {
      execlp("tail", "tail", "-0f", "/var/log/messages", NULL);
      /* if execlp failed, exit child anyway */
      exit(-1)
    }
    /* sleep for a second (in the parent only) before considering 
     * restarting the child */
    sleep(1);
  } while (waitpid(pid, &status, 0));
}

int main() {
  struct bufferevent *bev;
  int childfd[2];
  int pid;

  event_init();

  pipe(childfd);
  pid = fork();
  if (pid == 0) {
    close(0); /* we don't want to pass in stdin */
    dup2(childfd[1], 1); /* redirect stdout */
    looptail();
    return;
  }

  /* have a bufferevent watch our child's stdout */
  bev = bufferevent_new(childfd[0], bufread, NULL, NULL, NULL);
  bufferevent_enable(bev, EV_READ);
  event_dispatch();

  return 0;
}
