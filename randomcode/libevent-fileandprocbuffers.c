#include <sys/types.h>
#include <sys/stat.h>
#include <sys/queue.h>
#include <sys/wait.h>
#include <sys/time.h>
#include <unistd.h>
#include <fcntl.h>
#include <stdlib.h>
#include <stdio.h>
#include <string.h>
#include <errno.h>

#include <event.h>

void bufread(struct bufferevent *bev, void *data) {
  char *line;
  char *x = (char *)data;
  while ( (line = evbuffer_readline(bev->input)) != NULL ) {
    printf("%s: '%s'\n", x, line);
    free(line);
  }
}

void fileread_real(int fd, short what, void *data);
void startproc(int fd);

struct evfdpipe {
  int input;
  int output;
};

void filewatch(void) {
  int fd;
  int p[2];
  struct bufferevent *bev;
  struct timeval t = { 1, 0 };

  pipe(p);

  fd = open("/var/log/messages", O_RDONLY);
  //dup2(fd, p[1]);

  bev = bufferevent_new(p[0], bufread, NULL, NULL, "fileread");
  bufferevent_enable(bev, EV_READ);

  struct evfdpipe *ep = calloc(1, sizeof(struct evfdpipe));
  ep->input = fd;
  ep->output = p[1];
  event_once(p[1], EV_TIMEOUT, fileread_real, ep, &t);
}

void fileread_real(int unused, short what, void *data) {
  struct evfdpipe *ep = data;
  struct timeval t = { 1, 0 };

  char buf[4096];
  int bytes;
  bytes = read(ep->input, buf, 4096);
  printf("%d => %d == %d bytes\n",  ep->input, ep->output, bytes);
  write(ep->output, buf, bytes);

  event_once(-1, EV_TIMEOUT, fileread_real, ep, &t);
}

void _sigchld(int sig, short what, void *data) {
  int pid;
  int *fds = (int *)data;

  printf("SIGCHLD\n");
  while ((pid = waitpid(-1, NULL, WNOHANG)) > 0) {
    startproc(fds[1]);
  }
}

void startproc(int fd) {
  int pid;
  pid = fork();
  if (pid == 0) {
    close(0); /* we don't want to pass in stdin */
    dup2(fd, 1); /* redirect stdout */
    execlp("tail", "tail", "-0f", "/var/log/messages", NULL);
    /* if execlp failed, exit child anyway */
    exit(-1);
  }
}

int main() {
  struct bufferevent *bev;
  int childfd[2];
  int pid;

  event_init();

  pipe(childfd);

  /* have a bufferevent watch our child's stdout */
  bev = bufferevent_new(childfd[0], bufread, NULL, NULL, "childwatch");
  bufferevent_enable(bev, EV_READ);
  startproc(childfd[1]);
  
  filewatch();

  struct event sigevent;
  signal_set(&sigevent, SIGCHLD, _sigchld, &childfd);
  signal_add(&sigevent, NULL);

  event_dispatch();

  return 0;
}
