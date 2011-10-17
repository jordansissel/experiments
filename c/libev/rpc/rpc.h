#ifndef _RPC_H_
#define _RPC_H_

#include <ev.h>
#include <msgpack.h>
#include "porter.h"

typedef void (rpc_response)(void *context, msgpack_object *response, void *data);

typedef struct {
  /** libev io structure */
  ev_io io;

  /* libev loop */
  struct ev_loop *ev;

  /** The zmq context */
  void *zmq;

  /** The zmq address this call is talking to */
  const char *address;

  /** The zmq socket */
  void *socket;

  /** The callback invoked when this RPC call gets a reply */
  rpc_response *callback;

  /** msgpack message */
  msgpack_packer *request;
  msgpack_sbuffer *pack_buffer;

  /** Arbitrary data to pass to this callback */
  void *data;
} rpc_call_t;
                            
rpc_call_t *rpc_call_new(void *zmq, struct ev_loop *ev, const char *address,
                         const char *method);
void rpc_call(rpc_call_t *rpc, rpc_response *callback, void *data);
#endif /* _RPC_H_ */
