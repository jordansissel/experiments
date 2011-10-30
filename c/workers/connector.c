#define _BSD_SOURCE /* for inet_aton, etc */
#include <arpa/inet.h>
#include <errno.h>
#include <fcntl.h>
#include <netinet/in.h>
#include <netinet/in.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/socket.h>
#include <sys/socket.h>
#include <sys/socket.h>
#include <sys/types.h>
#include <time.h>
#include <unistd.h>
#include "insist.h"
#include "status.h"

int main(int argc, char **argv) {
  int rc;

  if (argc < 3) {
    printf("Usage: %s address port\n", argv[0]);
    return 1;
  }

  const char *address = argv[1];
  unsigned short port = (unsigned short)atoi(argv[2]);

  /* Assume ipv6, we'll shrink to ipv4 if needed later */
  socklen_t socklen = sizeof(struct sockaddr_in6);
  struct sockaddr *sockaddr = malloc(socklen);

  /* Try IPv6 first ... */
  if (inet_pton(AF_INET6, address,
                &((struct sockaddr_in6 *)sockaddr)->sin6_addr) == 1) {
    /* This appears to be a valid ipv6 address */
    sockaddr->sa_family = AF_INET6;
    ((struct sockaddr_in6 *)sockaddr)->sin6_port = htons(port);
    //printf("Using ipv6\n");
  } else {
    /* Shrink down to ipv4 */
    socklen = sizeof(struct sockaddr_in);
    sockaddr = realloc(sockaddr, socklen);
    if (inet_pton(AF_INET, address, 
                  &((struct sockaddr_in *)sockaddr)->sin_addr) == 1) {
      /* This appears to be a valid ipv4 address */
      sockaddr->sa_family = AF_INET;
      //printf("Using ipv4\n");
      ((struct sockaddr_in *)sockaddr)->sin_port = htons(port);
    } else {
      free(sockaddr);
      fprintf(stderr, "Invalid address: %s, can't listen.\n", address);
      return TERRIBLE_FAILURE;
    }
  } /* parse ipv4/ipv6 address */

  //printf("Family: %d\n", sockaddr->sa_family);

  int count = 10000;

  for (int i = 0; i < count; i++) {
    if (i % 500 == 0) { 
      printf("Count: %d\n", i);
    }
    int fd = socket(sockaddr->sa_family, SOCK_STREAM, 0);
    insist_return(fd != -1, TERRIBLE_FAILURE,
                  "socket() call failed; error(%d): %s", errno, strerror(errno))

    rc = connect(fd, sockaddr, socklen);
    insist_return(rc == 0, TERRIBLE_FAILURE, "listen(%d, 5) failed, "
                  "error(%d): %s", fd, errno, strerror(errno));
  }

  printf("Connected %d times to %s:%hu\n", count, address, port);

  return GREAT_SUCCESS;
} /* main */
