#include <sys/types.h>          /* See NOTES */
#include <sys/socket.h>
#include <string.h>
#include <netdb.h>
#include <stdio.h>

extern int h_errno;

int main(int argc, char **argv) {
  if (argc < 3) {
    fprintf(stderr, "Usage: %s host:port command [arg1 arg2 ..]\n", argv[0]);
    return 1;
  }

  int fd = socket(PF_INET, SOCK_STREAM, 0);
  size_t pos = strcspn(argv[1], ":");
  char *host = argv[1];
  short port = (short)atoi(argv[1] + pos + 1);
  host[pos] = '\0';
  //struct hostent *hent4 = gethostbyname2(host, PF_INET);

  struct sockaddr sa;
  socklen_t salen;
  
  printf("-> %s:%d\n", host, port);
  int inforet = getnameinfo(&sa, salen, host, strlen(host), NULL, 0, 0);
  if (inforet == 0) {
    printf("OK\n");
  } else {
    printf("%d\n", inforet);
    printf("%s\n", gai_strerror(inforet));
  }
  
  return -1;
}

