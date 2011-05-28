#include <sys/types.h>
#include <pwd.h>
#include <stdio.h>

int main(int argc, char **argv) {
  struct passwd *pw;

  if (argc < 2) {
    fprintf(stderr, "Usage: %s <username>\n", argv[0]);
    return 1;
  }

  pw = getpwnam(argv[1]);
  if (pw == NULL) {
    perror("getpwnam");
    return 2;
  }
  printf("Passwd for %s is '%s'\n", argv[1], pw->pw_passwd);

  return 0;
}

