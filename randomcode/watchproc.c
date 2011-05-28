#include <stdio.h>
#include <stdlib.h>
#include <signal.h>
#include <sys/wait.h>
#include <sys/types.h>

static int childpid;

void sigchild(int sig) {
  char *cmd;
  int status;
  //asprintf(&cmd, "cat /proc/%d/stat", childpid);
  asprintf(&cmd, "procstat %d", childpid);
  system(cmd); free(cmd);
  //asprintf(&cmd, "ls -lR /proc/%d/", childpid);
  //system(cmd); free(cmd);

  waitpid(childpid, &status, 0);
  printf("Child died with %d\n", status);
  exit(1);
}

int main(int argc, char **argv) {
  if (argc == 1) {
    printf("Usage: %s <command ...>\n", *argv);
    exit(1);
  }

  signal(SIGCHLD, sigchild);

  childpid = fork();
  if (childpid  == 0) {
    execvp(argv[1], argv + 1);
  }

  while (1) {
    sleep(3600);
  }
  
}
