#include "loggly_input.h"
#include "loggly_connection.h"
#include "insist.h"
#include <stdlib.h>
#include <stdio.h>
#include <errno.h>
#include <unistd.h>
#include <fcntl.h>

loggly_input *loggly_input_new(void) {
  loggly_input *input;
  input = calloc(1, sizeof(loggly_input));
  return input;
} /* loggly_input_new */

status_code loggly_input_start(loggly_input *input, struct ev_loop *loop) {
  int fd;
  int rc;

  switch (input->type) { case INPUT_TCP:
      fd = socket(AF_INET, SOCK_STREAM, 0);
      break;
    default:
      fprintf(stderr, "Unsupported input type: %d\n", input->type);
  }

  insist_return(fd >= 0, START_FAILURE,
                "socket() returned %d, an error: %s", fd, strerror(errno));
  
  struct sockaddr_in sockaddr;
  sockaddr.sin_family = AF_INET;
  sockaddr.sin_port = htons(input->port);
  /* TODO(sissel): Support dns lookups? */
  rc = inet_aton("0.0.0.0", &sockaddr.sin_addr);
  insist_return(rc != 0, START_FAILURE, "inet_aton returned %d, error: %s",
                rc, strerror(errno));

  rc = bind(fd, (struct sockaddr *)&sockaddr, sizeof(sockaddr));
  insist_return(rc == 0, START_FAILURE, "bind returned %d , error: %s",
                rc, strerror(errno));

  rc = fcntl(fd, F_SETFL, O_NONBLOCK);
  insist_return(rc != -1, START_FAILURE, "fcntl returned %d , error: %s",
                rc, strerror(errno));

  rc = listen(fd, 5);
  insist_return(rc != -1, START_FAILURE, "listen returned %d , error: %s",
                rc, strerror(errno));

  ev_io_init(&input->io, loggly_input_connect_cb, fd, EV_READ);
  ev_io_start(loop, &input->io);
} /* loggly_input_start */

void loggly_input_connect_cb(struct ev_loop *loop, ev_io *watcher,
                             int revents) {
  int client_fd;
  int server_fd = watcher->fd;
  /* TODO(sissel): ipv6 support? */
  struct sockaddr_in addr;
  socklen_t addrlen = sizeof(struct sockaddr_in);

  while (1) {
    loggly_input_connection *connection;
    client_fd = accept(server_fd, (struct sockaddr*)&addr, &addrlen);

    if (client_fd < 0) {
      /* no more connections to accept */
      break;
    }

    printf("New connect\n");

    connection = calloc(1, sizeof(loggly_input_connection));
    connection->buffer_len = 4096;
    connection->buffer = malloc(connection->buffer_len);
    connection->address_len = sizeof(struct sockaddr_in);
    connection->address = calloc(1, connection->address_len);
    ev_io_init(&connection->io, loggly_input_stream_cb, client_fd, EV_READ);
    ev_io_start(loop, &connection->io);
  }
}

