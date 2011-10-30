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
    /* Create a new session and set it up with libev */
    Session *session = session_new(fd, &address, address_len);
    session->data = server;

    session_free(session);

    /* TODO(sissel): Start a thread to handle this connection */
  }

  fprintf(stderr, "accept(%d, ...) failed, errno(%d): %s\n",
          server->fd, errno, strerror(errno));
} /* server_accept */

void session_read_cb(struct ev_loop *loop, ev_io *io, int revents) {
  static ssize_t bufsize = 4096;
  static char buffer[4096];
  Session *session = io->data;
  ssize_t bytes;
  int done = 0;

  while (!done) {
    bytes = read(io->fd, buffer, bufsize);
    if (bytes == 0) {
      /* EOF, close up... */
      ev_io_stop(loop, io);
      session_free(session);
      done = 1;
    } else if (bytes < 0) {
      /* EAGAIN occurs when the socket has no more data to read */
      if (errno != EAGAIN) {
        fprintf(stderr, "read(%d, ...) error(%d): %s\n", io->fd,
                errno, strerror(errno));
      }
      done = 1;
    } else {
      printf("%s:%hu => '%.*s'\n", session->peer_address, session->peer_port,
             (int)bytes, buffer);
    }
  } /* looping forever */
} /* session_read_cb */

int main(void) {
  //Server *server = server_new("0.0.0.0", 7000);
  Server *server = server_new("::", 7000);
  Status rc;

  rc = server_listen(server);
  insist_return(rc == GREAT_SUCCESS, rc, "Server failed to start listening")

  server_accept();
  return 0;
} /* main */
