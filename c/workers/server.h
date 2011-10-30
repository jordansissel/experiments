#ifndef _SERVER_H_
#define _SERVER_H_

#ifdef EVENTED
#include <ev.h>
#endif

typedef struct server {
#ifdef EVENTED
  ev_io *io; /* TODO(sissel): move this outside the Server struct */
#endif
  int fd;
  const char *address;
  unsigned short port;
} Server;

Server *server_new(const char *address, unsigned short port);
int server_listen(Server *server, int nonblocking);

#endif /* _SERVER_H_ */
