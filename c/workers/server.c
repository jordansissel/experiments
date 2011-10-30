#define _BSD_SOURCE /* for inet_aton, etc */
#include <arpa/inet.h>
#include <errno.h>

#ifdef EVENTED
#include <ev.h>
#endif 

#include <fcntl.h>
#include <netinet/in.h>
#include <netinet/in.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/socket.h>
#include <sys/socket.h>
#include <time.h>
#include <unistd.h>

#include "insist.h"
#include "session.h"
#include "server.h"
#include "status.h"

/* Make this Server listen on the network */
int server_listen(Server *server, int nonblocking) {
  int rc;

  /* TODO(sissel): Support dns lookups? */

  /* Assume ipv6, we'll shrink to ipv4 if needed later */
  socklen_t socklen = sizeof(struct sockaddr_in6);
  struct sockaddr *sockaddr = malloc(socklen);

  /* Try IPv6 first ... */
  if (inet_pton(AF_INET6, server->address,
                &((struct sockaddr_in6 *)sockaddr)->sin6_addr) == 1) {
    /* This appears to be a valid ipv6 address */
    sockaddr->sa_family = AF_INET6;
    ((struct sockaddr_in6 *)sockaddr)->sin6_port = htons(server->port);
    //printf("Using ipv6\n");
  } else {
    /* Shrink down to ipv4 */
    socklen = sizeof(struct sockaddr_in);
    sockaddr = realloc(sockaddr, socklen);
    if (inet_pton(AF_INET, server->address, 
                  &((struct sockaddr_in *)sockaddr)->sin_addr) == 1) {
      /* This appears to be a valid ipv4 address */
      sockaddr->sa_family = AF_INET;
      //printf("Using ipv4\n");
      ((struct sockaddr_in *)sockaddr)->sin_port = htons(server->port);
    } else {
      free(sockaddr);
      fprintf(stderr, "Invalid address: %s, can't listen.\n", server->address);
      return TERRIBLE_FAILURE;
    }
  } /* parse ipv4/ipv6 address */

  //printf("Family: %d\n", sockaddr->sa_family);
  server->fd = socket(sockaddr->sa_family, SOCK_STREAM, 0);
  insist_return(server->fd != -1, TERRIBLE_FAILURE,
                "socket() call failed; error(%d): %s", errno, strerror(errno))

  /* Enable socket reuse. This is mainly necessary in cases of restarts that
   * leave open sockets in CLOSE_WAIT or other states that are not LISTEN */
  int val = 1; /* enable reuseaddr */
  rc = setsockopt(server->fd, SOL_SOCKET, SO_REUSEADDR, &val, sizeof(val));
  insist_return(rc != -1, TERRIBLE_FAILURE, "setsockopt with SO_REUSEADDR "
                "returned %d, error %s", rc, strerror(errno));

  /* Bind on the port/address requested */
  rc = bind(server->fd, sockaddr, socklen);
  free(sockaddr); /* don't need this anymore */
  insist_return(rc == 0, TERRIBLE_FAILURE, 
                "bind on %s:%hu returned %d , error(%d): %s",
                server->address, server->port, rc, errno, strerror(errno));

  if (nonblocking) {
    /* Enable non-blocking */
    rc = fcntl(server->fd, F_SETFL, O_NONBLOCK);
    insist_return(rc != -1, TERRIBLE_FAILURE, "fcntl to set ON_NONBLOCK returned "
                  "%d, error(%d): %s", rc, errno, strerror(errno));
  }

  rc = listen(server->fd, 100);
  insist_return(rc == 0, TERRIBLE_FAILURE, "listen(%d, 5) failed, "
                "error(%d): %s", server->fd, errno, strerror(errno));

  return GREAT_SUCCESS;
} /* server_listen */

Server *server_new(const char *address, unsigned short port) {
  Server *server = calloc(1, sizeof(Server));
  server->address = address;
  server->port = port;
  server->fd = -1;

  return server;
} /* server_new */
