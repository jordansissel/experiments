#include <syslog.h>

int main(int argc, char *argv[]) {
  //openlog(argv[0], LOG_PERROR, LOG_LOCAL0);
  openlog(argv[0], 0, LOG_LOCAL0);
  syslog(LOG_INFO, "%s", argv[1]);
  closelog();
  return 0;
}

