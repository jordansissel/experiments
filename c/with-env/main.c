#define _GNU_SOURCE /* for execvpe */

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include <fcntl.h>
#include <sys/stat.h>
#include <sys/mman.h>
#include <errno.h>


int main(int argc, char *argv[]) {
  if (argc < 3) {
    fprintf(stderr, "Usage: %s <pid> <command> [args ...]\n", argv[0]);
    return 1;
  }

  const pid_t pid = atoi(argv[1]);

  char environ_path[100];

  if (snprintf(environ_path, sizeof(environ_path), "/proc/%d/environ", pid) > sizeof(environ_path)) {
    fprintf(stderr, "proc environ path was longer than expected... hmmm..\n");
    return 1;
  }

  int fd = open(environ_path, O_RDONLY);
  if (fd < 0) { 
    fprintf(stderr, "open(%s) failed: %s\n", environ_path, strerror(errno));
    return 1;
  }

  // Can't use fstat(2) because /proc/PID/environ always reports 0 for st_size.
  //struct stat st;
  //if (fstat(fd, &st) != 0) {
    //fprintf(stderr, "fstat failed: %s\n", strerror(errno));
    //return 1;
  //

  // Gotta read the whole file, I guess.
  int env_pos = 0;
  int env_size = 4096;
  char *env = calloc(env_size, 1);
  const int chunk = 4096;
  int b = 0;
  while ((b = read(fd, env + env_pos, chunk)) > 0) {
    if (env_pos >= env_size) {
      env_size = env_pos + chunk;
      env = realloc(env, env_size);
    }
    env_pos += b;
  }

  if (b < 0) {
    fprintf(stderr, "read on %s failed: %s\n", environ_path, strerror(errno));
    return 1;
  }

  int envp_size = 0;
  char **envp = NULL;
  int envcount = 0;
  for (char *e = env; e < env+env_pos; e += strlen(e) + 1) {
    if (envcount >= envp_size) {
      envp_size += 100;
      envp = reallocarray(envp, envp_size, sizeof(char *));
    }

    envp[envcount] = e;
    envcount++;
  }

  if (-1 == execvpe(argv[2], argv+2, envp)) {
    fprintf(stderr, "execvpe %s failed: %s\n", argv[2], strerror(errno));
    return 1;
  }
}
