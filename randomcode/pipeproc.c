#include <unistd.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <fcntl.h>


int main() {
  pid_t pid;

  int status;
  int fd;
  int p[2];
  fd = open("/var/log/messages", O_RDONLY);

  pid = fork();
  if (pid == 0) {
    dup2(fd, 0);
    execlp("cat", "cat", NULL);
    exit(-1);
  }

  waitpid(-1, &status, 0);
  printf("exiting\n");
  return 0;
}
