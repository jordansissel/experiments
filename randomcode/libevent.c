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

//void fileread(int fd, short evtype, void *data) {
void fileread(struct bufferevent *bev, void *data) {
  printf("OK\n");
}

int main() {
  struct event ev;
  struct bufferevent *bev;
  int fd;
  fd = open("/var/log/messages", O_RDONLY);

  event_init();
  bev = bufferevent_new(fd, fileread, NULL, NULL, NULL);
  bufferevent_enable(bev, EV_READ);
  //event_set(&ev, 0, EV_READ | EV_PERSIST, fileread, NULL);
  //event_add(&ev, NULL);
  event_dispatch();

  return 0;
}
