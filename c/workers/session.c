#include "session.h"
#include <arpa/inet.h>
#include <stdlib.h>
#include <stdio.h>
#include <errno.h>
#include <string.h>
#include <unistd.h>

Session *session_new(int fd, struct sockaddr *address, socklen_t address_len) {
  Session *session = calloc(1, sizeof(*session));
  socklen_t address_size;
  void *sin_addr;

  switch (address->sa_family) {
    case AF_INET: 
      address_size = INET_ADDRSTRLEN;
      session->peer_port = ntohs(((struct sockaddr_in *)address)->sin_port);
      sin_addr = &((struct sockaddr_in *)address)->sin_addr;
      break;
    case AF_INET6: 
      address_size = INET6_ADDRSTRLEN;
      session->peer_port = ntohs(((struct sockaddr_in6 *)address)->sin6_port);
      sin_addr = &((struct sockaddr_in6 *)address)->sin6_addr;
      break;
  }

  session->fd = fd;
  session->peer_address = calloc(1, address_size);
  const char *ret;
  ret = inet_ntop(address->sa_family, sin_addr, session->peer_address, address_size);
  if (ret == NULL) {
    free(session);
    fprintf(stderr, "inet_ntop(%d, ...) failed, error(%d): %s\n",
            address->sa_family, errno, strerror(errno));
    return NULL;
  }

  session->io = calloc(1, sizeof(*session->io));
  printf("New server connection from %s:%hu\n", session->peer_address,
         session->peer_port);
  return session;
} /* session_new */

void session_free(Session *session) {
  //printf("Closing session from %s:%hu\n", session->peer_address,
         //session->peer_port);
  close(session->fd);
  free(session->peer_address);
  free(session);
} /* session_free */

