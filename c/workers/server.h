#ifndef _SERVER_H_
#define _SERVER_H_

#include <ev.h>

typedef struct server {
  ev_io *io; /* TODO(sissel): move this outside the Server struct */
  int fd;
  const char *address;
  unsigned short port;
} Server;

Server *server_new(const char *address, unsigned short port);
int server_listen(Server *server);

#endif /* _SERVER_H_ */
