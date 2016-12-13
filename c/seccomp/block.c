#include <stdio.h>
#include <seccomp.h>
#include <unistd.h>
#include <errno.h>

int main(int argc, char **argv) {
  void *ctx;
  ctx = seccomp_init(SCMP_ACT_ALLOW);
  seccomp_rule_add(ctx, SCMP_ACT_ERRNO(EACCES), SCMP_SYS(connect), 0);

  argv++;
  seccomp_load(ctx);
  printf("Running: %s\n", argv[0]);
  execvp(argv[0], argv);
}
