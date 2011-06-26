#ifndef _LOGGLY_INPUT_H_
#define _LOGGLY_INPUT_H_

#include <ev.h>

typedef enum {
  UNUSED_CODE,
  START_FAILURE,
} status_code;

struct loggly_input {
  ev_io io;
  short port;
  char *collection;
  char *name;
  int id;

  enum { INPUT_TCP, INPUT_UDP, INPUT_TLS } type;

  /* TODO(sissel): Access control */
  /* TODO(sissel): list of active client connections
   * Probably just the libev watchers */
}; /* struct loggly_input */

typedef struct loggly_input loggly_input;

loggly_input *loggly_input_new(void);
status_code loggly_input_start(loggly_input *input, struct ev_loop *loop);
void loggly_input_stream_cb(struct ev_loop *loop, ev_io *watcher, int revents);
void loggly_input_datagram_cb(struct ev_loop *loop, ev_io *watcher, int revents);
void loggly_input_connect_cb(struct ev_loop *loop, ev_io *watcher, int revents);


#endif /* _LOGGLY_INPUT_H_ */
