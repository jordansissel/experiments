#define _BSD_SOURCE /* for inet_aton, etc */
#include <errno.h>
#include <stdio.h>
#include <string.h>
#include <unistd.h>

#include "insist.h"
#include "session.h"
#include "server.h"
#include "status.h"

static void server_accept(Server *server);

/* Called when a new connection occurs. This method sets up handling for the
 * new connection. */
void server_accept(Server *server) {
  struct sockaddr address;
  socklen_t address_len = sizeof(address);

  /* Try to accept all pending connections */
  int fd;
  while ((fd = accept(server->fd, &address, &address_len)) >= 0) {
    /* Create a new session for this connection */
    Session *session = session_new(fd, &address, address_len);
    session->data = server;
    session->fd = fd;

    /* Do nothing ... */
  }

  fprintf(stderr, "accept(%d, ...) failed, errno(%d): %s\n",
          server->fd, errno, strerror(errno));
} /* server_accept */

int main(void) {
  Server *server = server_new("0.0.0.0", 7000);
  //Server *server = server_new("::", 7000);
  Status rc;

  rc = server_listen(server, 0);
  insist_return(rc == GREAT_SUCCESS, rc, "Server failed to start listening")
  printf("fd: %d\n", server->fd);

  server_accept(server);
  return 0;
} /* main */
