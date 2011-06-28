#ifndef _LOGGLY_CONNECTION_H_
#define _LOGGLY_CONNECTION_H_

#include <unistd.h>
#include <fcntl.h>
#include <string.h>
#include <stdlib.h>
#include <ev.h>
#include <stdio.h>
#include <errno.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <netdb.h>

#include "loggly_input.h"
#include "syslog_rfc3164.h"

struct loggly_input_connection {
  ev_io io;
  char *buffer;
  size_t buffer_len;
  loggly_input *input;
  struct sockaddr *address;
  socklen_t address_len;
  struct syslog3164_parser *parser;
}; /* struct loggly_input_connection */

typedef struct loggly_input_connection loggly_input_connection;

void loggly_input_connection_free(loggly_input_connection *connection);
void loggly_input_connection_stop(struct ev_loop *loop,
                                  loggly_input_connection *connection);
#endif /* _LOGGLY_CONNECTION_H_ */
