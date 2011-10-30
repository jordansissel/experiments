#ifndef _SESSION_H_
#define _SESSION_H_
#define _BSD_SOURCE /* for struct timespec, etc */

#define _BSD_SOURCE
#include <arpa/inet.h>
#include <time.h>

#ifdef EVENTED
#include <ev.h>
#endif

typedef struct session {
#ifdef EVENTED
  ev_io *io; /* TODO(sissel): move this outside the Server struct */
#endif
  int fd;
  char *peer_address;
  unsigned short peer_port;

  void *data; /* arbitrary data associated with this session */
  /** When this session was started */
  struct timespec start_time;
} Session;

Session *session_new(int fd, struct sockaddr *address, socklen_t address_len);
void session_free(Session *session);

#endif /* _SESSION_H_ */
