#ifndef _LOGGLY_INPUT_H_
#define _LOGGLY_INPUT_H_

#include <ev.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <netdb.h>
#include "syslog_rfc3164.h"

typedef enum {
  GREAT_SUCCESS,
  START_FAILURE,
} status_code;

struct loggly_input {
  ev_io io; /* the server socket io */
  short port; /** the port to listen on */
  char *collection; /** the collection id */
  char *name; /** the name of this input */
  int id; /** the input id */

  /* The type of input */
  enum { INPUT_TCP, INPUT_UDP, INPUT_TLS } type;

  int discover; /** Are we in discovery mode? */

  ev_io *clients; /** list of client connection watchers  */
  int num_clients; /** number of active clients */

  /* TODO(sissel): stats? */
  long long message_count;
}; /* struct loggly_input */

typedef struct loggly_input loggly_input;

loggly_input *loggly_input_new(void);
status_code loggly_input_start(loggly_input *input, struct ev_loop *loop);
status_code loggly_input_listen(loggly_input *input, struct ev_loop *loop);
void loggly_input_stream_cb(struct ev_loop *loop, ev_io *watcher, int revents);
void loggly_input_datagram_cb(struct ev_loop *loop, ev_io *watcher, int revents);
void loggly_input_connect_cb(struct ev_loop *loop, ev_io *watcher, int revents);
void loggly_input_event(struct syslog3164_parser *parser);

#endif /* _LOGGLY_INPUT_H_ */
