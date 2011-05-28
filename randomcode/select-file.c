#include <sys/types.h>
#include <sys/stat.h>
#include <sys/select.h>
#include <fcntl.h>
#include <stdio.h>

int main() {
  struct timeval t = { 1, 0 };
  fd_set vi, ve;
  int fd;

  fd = open("/var/log/messages", O_RDONLY);
  FD_ZERO(&vi);
  FD_ZERO(&ve);
  FD_SET(fd, &vi);
  FD_SET(fd, &ve);

  select(FD_SETSIZE, &vi, NULL, &ve, &t);
  if (FD_ISSET(fd, &vi))
    printf("Can read from %d\n", fd);
  if (FD_ISSET(fd, &ve))
    printf("error from %d\n", fd);
  return 0;
}
