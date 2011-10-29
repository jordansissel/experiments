#define _BSD_SOURCE /* for inet_aton, etc */
#include <arpa/inet.h>
#include <errno.h>
#include <ev.h>
#include <fcntl.h>
#include "insist.h"
#include <netinet/in.h>
#include <netinet/in.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <sys/socket.h>
#include <sys/socket.h>
#include <time.h>
#include <unistd.h>

typedef struct server {
  ev_io *io;
  int fd;
  char *address;
  unsigned short port;
} Server;

typedef struct session {
  ev_io *io;
  int fd;
  char *peer_address;
  unsigned short peer_port;

  /* When this session was started */
  struct timespec start_time;
} Session;

typedef enum {
  GREAT_SUCCESS = 0,
  TERRIBLE_FAILURE
} status;

static void new_session_cb(EV_P_ ev_io *io, int revents);

/* Called when a new connection occurs. This method sets up handling for the
 * new connection. */
void new_session_cb(EV_P_ ev_io *io, int revents) {
  Server *server = (struct server *)io->data;

  struct sockaddr_in address;
  socklen_t address_len = sizeof(address);
  int fd = accept(server->fd, (struct sockaddr *)&address, &address_len);
  insist_return(fd >= 0, (void)(0), "accept() failed, error(%d): %s", errno,
                strerror(errno));

  Session *session = calloc(1, sizeof(*session));
  session->fd = fd;
  session->peer_address = strdup(inet_ntoa(address.sin_addr));
  session->peer_port = ntohs(address.sin_port);
  printf("New server connection from %s:%hu\n", session->peer_address,
         session->peer_port);
} /* new_session_cb */

/* Make this Server listen on the network */
int server_listen(Server *server) {
  int rc;

  server->fd = socket(AF_INET, SOCK_STREAM, 0);
  insist_return(server->fd != -1, TERRIBLE_FAILURE,
                "socket() call failed; error(%d): %s", errno, strerror(errno))

  /* TODO(sissel): Support dns lookups? */
  struct sockaddr_in sockaddr;
  sockaddr.sin_family = AF_INET;
  sockaddr.sin_port = htons(server->port);
  rc = inet_aton(server->address, &sockaddr.sin_addr);
  insist_return(rc != 0, TERRIBLE_FAILURE, 
                "inet_aton(%s) failed, invalid address: %s", server->address)

  /* Enable socket reuse. This is mainly necessary in cases of restarts that
   * leave open sockets in CLOSE_WAIT or other states that are not LISTEN */
  int val = 1; /* enable reuseaddr */
  rc = setsockopt(server->fd, SOL_SOCKET, SO_REUSEADDR, &val, sizeof(val));
  insist_return(rc != -1, TERRIBLE_FAILURE, "setsockopt with SO_REUSEADDR "
                "returned %d, error %s", rc, strerror(errno));

  /* Bind on the port/address requested */
  rc = bind(server->fd, (struct sockaddr *)&sockaddr, sizeof(sockaddr));
  insist_return(rc == 0, TERRIBLE_FAILURE, 
                "bind on %s:%hu returned %d , error(%d): %s",
                server->address, server->port, rc, errno, strerror(errno));

  /* Enable non-blocking */
  rc = fcntl(server->fd, F_SETFL, O_NONBLOCK);
  insist_return(rc != -1, TERRIBLE_FAILURE, "fcntl to set ON_NONBLOCK returned "
                "%d, error(%d): %s", rc, errno, strerror(errno));

  rc = listen(server->fd, 5);
  insist_return(rc == 0, TERRIBLE_FAILURE, "listen(%d, 5) failed, "
                "error(%d): %s", errno, strerror(errno));

  return GREAT_SUCCESS;
} /* server_listen */

int main(void) {
  struct ev_loop *loop = EV_DEFAULT;
  Server *server = calloc(1, sizeof(*server));
  status rc;

  server->address = "0.0.0.0";
  server->port = 7000;

  rc = server_listen(server);
  insist_return(rc == GREAT_SUCCESS, rc, "Server failed to start listening")

  /* set up the libev callback for new connections to our server */
  server->io = calloc(1, sizeof(*server->io));
  server->io->data = server;
  ev_io_init(server->io, new_session_cb, server->fd, EV_READ);
  ev_io_start(loop, server->io);
  printf("Server now listening on %s:%hu\n", server->address, server->port);

  ev_run (loop, 0);
  return 0;
} /* main */
