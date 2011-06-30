#include "loggly_input.h"
#include "loggly_connection.h"
#include "insist.h"
#include <sys/socket.h>
#include <netinet/in.h>
#include <arpa/inet.h>
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
  int rc;
  rc = loggly_input_listen(input, loop);

  if (rc == START_FAILURE) {
    /* TODO(sissel): Schedule a restart of this. */
  }
} /* loggly_input_start */

status_code loggly_input_listen(loggly_input *input, struct ev_loop *loop) {
  int fd;
  int rc;

  switch (input->type) {
    case INPUT_TCP:
      fd = socket(AF_INET, SOCK_STREAM, 0);
      break;
    //case INPUT_UDP:
      //fd = socket(AF_INET, SOCK_DGRAM, 0);
      //break;
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
  insist_return(rc != 0, START_FAILURE, "input[%d]: inet_aton returned %d, error: %s",
                input->id, rc, strerror(errno));

  rc = bind(fd, (struct sockaddr *)&sockaddr, sizeof(sockaddr));
  insist_return(rc == 0, START_FAILURE, "input[%d]: bind port %d returned %d , error: %s",
                input->id, input->port, rc, strerror(errno));

  rc = fcntl(fd, F_SETFL, O_NONBLOCK);
  insist_return(rc != -1, START_FAILURE, "input[%d]: fcntl returned %d , error: %s",
                input->id, rc, strerror(errno));

  rc = listen(fd, 5);
  insist_return(rc != -1, START_FAILURE, "input[%d]: listen returned %d , error: %s",
                input->id, rc, strerror(errno));

  printf("input[%d]: ready\n", input->id);
  ev_io_init(&input->io, loggly_input_connect_cb, fd, EV_READ);
  ev_io_start(loop, &input->io);

  return GREAT_SUCCESS;
} /* loggly_input_start */

void loggly_input_connect_cb(struct ev_loop *loop, ev_io *watcher,
                             int revents) {
  int client_fd;
  int server_fd = watcher->fd;
  /* TODO(sissel): ipv6 support? */
  struct sockaddr_in addr;
  loggly_input *input = (loggly_input *)watcher;
  socklen_t addrlen = sizeof(struct sockaddr_in);

  while (1) {
    loggly_input_connection *connection;
    client_fd = accept(server_fd, (struct sockaddr*)&addr, &addrlen);

    if (client_fd < 0) {
      /* no more connections to accept */
      break;
    }

    connection = calloc(1, sizeof(loggly_input_connection));

    /* TODO(sissel): Track this connection so we can close it later if
     * necessary - getpeername(2) helps */
    socklen_t socklen = sizeof(struct sockaddr_in);
    getpeername(client_fd, (struct sockaddr *)&connection->client_addr, &socklen);

    uint32_t mask = 127 << 24;
    uint32_t addr = connection->client_addr.sin_addr.s_addr;

    /* do any ACL filtering */

    connection->buffer_len = 4096;
    connection->buffer = malloc(connection->buffer_len);
    connection->address_len = sizeof(struct sockaddr_in);
    connection->address = calloc(1, connection->address_len);
    connection->parser = calloc(1, sizeof(struct syslog3164_parser));
    syslog3164_init(connection->parser);
    connection->input = input;

    connection->parser->callback = loggly_input_event;
    connection->parser->data = connection;

    ev_io_init(&connection->io, loggly_input_stream_cb, client_fd, EV_READ);
    ev_io_start(loop, &connection->io);
  }
} /* loggly_input_connect_cb */

void loggly_input_event(struct syslog3164_parser *parser) {
  loggly_input_connection *connection = parser->data;
  loggly_input *input = connection->input;

  input->message_count++;

  if (input->message_count == 1000000) {
    printf("Count: %d\n", input->message_count);
    input->message_count = 0;
    printf("Got message for input:%d, collection:%s, name:%s, port:%d\n",
           input->id, input->collection, input->name, input->port);
    printf("<%d>%.*s %.*s\n", parser->priority, parser->timestamp_pos,
           parser->timestamp, parser->message_pos, parser->message);
  }
} /* loggly_input_event */
