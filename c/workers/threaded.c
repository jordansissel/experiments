#define _BSD_SOURCE /* for inet_aton, etc */
#include <errno.h>
#include <stdio.h>
#include <string.h>
#include <unistd.h>
#include <pthread.h>

#include "insist.h"
#include "session.h"
#include "server.h"
#include "status.h"

static void server_accept(Server *server);
static void *session_read_loop(void *data);

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

    /* Start a thread to handle this connection */
    pthread_t *thread = malloc(sizeof(*thread));
    pthread_create(thread, NULL, session_read_loop, session);
  }

  fprintf(stderr, "accept(%d, ...) failed, errno(%d): %s\n",
          server->fd, errno, strerror(errno));
} /* server_accept */

void *session_read_loop(void *data) {
  Session *session = (Session *)data;
  static ssize_t bufsize = 4096;
  static char buffer[4096];
  ssize_t bytes;
  int done = 0;

  while (!done) {
    bytes = read(session->fd, buffer, bufsize);
    if (bytes == 0) {
      /* EOF, close up... */
      session_free(session);
      done = 1;
    } else if (bytes < 0) {
      /* EAGAIN occurs when the socket has no more data to read */
      if (errno != EAGAIN) {
        fprintf(stderr, "read(%d, ...) error(%d): %s\n", session->fd,
                errno, strerror(errno));
      }
      done = 1;
    } else {
      printf("%s:%hu => '%.*s'\n", session->peer_address, session->peer_port,
             (int)bytes, buffer);
    }
  } /* looping forever */

  /* Socket closed, let's clean up */
  session_free(session);
  return NULL;
} /* session_read_loop */

int main(void) {
  //Server *server = server_new("0.0.0.0", 7000);
  Server *server = server_new("::", 7000);
  Status rc;

  rc = server_listen(server, 0);
  insist_return(rc == GREAT_SUCCESS, rc, "Server failed to start listening")
  printf("fd: %d\n", server->fd);

  server_accept(server);
  return 0;
} /* main */
