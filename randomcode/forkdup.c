#include <unistd.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main() {
  pid_t pid;

  int cout[2], cin[2], cerr[2];
  pipe(cin);
  pipe(cout);
  pipe(cout);

  pid = fork();
  if (pid == 0) {
    /* child */
    dup2(cin[0], 0);
    dup2(cout[1], 1);
    dup2(cerr[1], 2);
    execlp("tail", "-f", "/var/log/messages");
  } else {
    /* parent */
    char *thing = "hello there\n";
    char buf[1024];
    FILE *childstdout = fdopen(cout[0], "r");
    while (fgets(buf, 1024, childstdout)) {
      printf("Parent got: %s", buf);
    }
    waitpid(-1, 0);
  }

}
