#include <stdio.h>
#include <string.h>

#define ENC_TYPE_INT 1
#define ENC_TYPE_STR 2

#define ENC_FORMAT_INT(x) "%.*s"
#define ENC_FORMAT_STR(x) "%d%.*s"

struct user {
  char *user;
  int uid;
};

int main() {
  struct user u;
  u.user = strdup("jls");
  u.uid = 5;

  printf("%.*s\n", sizeof(u.uid), &u.uid);
  return 0;
}
