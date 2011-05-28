#include <sys/types.h>
#include <sys/ptrace.h>
#include <sys/reg.h>
#include <sys/syscall.h>
#include <sys/wait.h>
#include <sys/user.h>
#include <stdio.h>
#include <unistd.h>

int main(int argc, char **argv) {
  pid_t child;
  child = fork();
  if (child == 0) {
    ptrace(PTRACE_TRACEME, 0, NULL, NULL);
    execvp(argv[1], argv + 1);
  } else {
    return tracer(child);
  }
  return 0;
}

int tracer(int pid) {
  long orig_eax;
  struct user_regs_struct regs;
  int status;
  char *str, *laddr;
  int start = 0;

  union u {
    long val;
    char chars[sizeof(long)];
  } data;

  while (1) {

    wait(&status);
    if (WIFEXITED(status))
      break;

    /* 64bit only */
    ptrace(PTRACE_GETREGS, pid, 0, &regs);
    switch (regs.orig_rax) {
      case SYS_open:
        if (start == 1) {
          start = 0; /* Is the syscall return */
          break;
        } else {
          start = 1;
        }

        ptrace(PTRACE_PEEKDATA, pid, regs.orig_rax);
        printf("0: %lx\n", regs.rbx);
        printf("data 0: %lx\n", ptrace(PTRACE_PEEKDATA, pid, regs.rbx));
        data.val = ptrace(PTRACE_PEEKDATA, pid, regs.rbx);
        if (data.val != 0xffffffffffffffffL) {
          printf("str: '%.*s'\n", (int) sizeof(long), data.chars);
        }
        break;
    }

    ptrace(PTRACE_SYSCALL, pid, NULL, NULL);
  }
}
