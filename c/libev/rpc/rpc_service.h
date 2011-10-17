#ifndef _RPC_SERVICE_H_
#define _RPC_SERVICE_H_

#include <ev.h>
#include <msgpack.h>
#include "porter.h"

typedef struct {
  /** libev io structure */
  ev_io io;

  /* libev loop */
  struct ev_loop *ev;

  /** The zmq context */
  void *zmq;

  /** The zmq address this service is listening on */
  const char *address;

  /** The zmq socket */
  void *socket;

  /** All registered methods .
   * this is a tree of string type -> rpc_method type
   */
  GTree *methods;
} rpc_service_t;

typedef void (rpc_callback)(void *context, msgpack_object *request,
                            msgpack_packer *result, msgpack_packer *error,
                            void *data);
                            
typedef struct {
  const char *name;
  size_t len;
} rpc_name;

typedef struct {
  rpc_callback *callback;
  void *data;
} rpc_method;

rpc_service_t *rpc_service_new(const char *address);
void rpc_service_start(rpc_service_t *service, struct ev_loop *ev);
void rpc_service_register(rpc_service_t *service, const char *method_name,
                          rpc_callback *callback, void *data);

#define DEFINE_RPC_METHOD(name) \
  void name(void *context, msgpack_object *request, \
            msgpack_packer *result, msgpack_packer *error, \
            void *data)

#endif /* _RPC_SERVICE_H_ */
