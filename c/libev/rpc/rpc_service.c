#include <ev.h>
#include "insist.h"
#include "msgpack_helpers.h"
#include "porter.h"
#include "rpc_service.h"
#include <string.h>
#include <zmq.h>
#include <zmq_utils.h>

static void rpc_service_poll(EV_P_ ev_io *watcher, int revents);
static void rpc_service_receive(rpc_service_t *service);
static void rpc_service_handle(rpc_service_t *service, zmq_msg_t *request);
static int rpc_name_cmp(const void *a, const void *b);

void rpc_m_list_methods(void *context, msgpack_object *request,
                        msgpack_packer *result, msgpack_packer *error,
                        void *data);
void rpc_m_echo(void *context, msgpack_object *request,
                msgpack_packer *result, msgpack_packer *error, void *data);

rpc_service_t *rpc_service_new(const char *address) {
  rpc_service_t *service = calloc(1, sizeof(rpc_service_t));
  service->methods = g_tree_new(rpc_name_cmp);
  service->address = address;
  return service;
} /* rpc_service_new */

void rpc_service_start(rpc_service_t *service, struct ev_loop *ev) {
  int rc;

  printf("Starting RPC service on %s\n", service->address);
  void *socket = zmq_socket(service->zmq, ZMQ_REP);
  insist(socket != NULL, "zmq_socket returned NULL. zmq error(%d): %s",
         zmq_errno(), zmq_strerror(zmq_errno()));

  rc = zmq_bind(socket, service->address);
  insist(rc == 0, 
         "zmq_bind(\"%s\") returned %d (I expected: 0). zmq error(%d): %s",
         service->address, rc, zmq_errno(), zmq_strerror(zmq_errno()));

  /* TODO(sissel): Turn this 'get fd' into a method */
  int socket_fd;
  size_t len = sizeof(socket_fd);
  rc = zmq_getsockopt(socket, ZMQ_FD, &socket_fd, &len);
  insist(rc == 0, "zmq_getsockopt(ZMQ_FD) expected to return 0, but got %d",
         rc);

  rpc_service_register(service, "list_methods", rpc_m_list_methods, service);
  rpc_service_register(service, "echo", rpc_m_echo, NULL);

  service->socket = socket;
  service->ev = ev;
  ev_io_init(&service->io, rpc_service_poll, socket_fd, EV_READ);
  ev_io_start(service->ev, &service->io);

  printf("RPC/API started\n");
} /* rpc_service_start */

void rpc_service_poll(EV_P_ ev_io *watcher, int revents) {
  rpc_service_t *service = (rpc_service_t *)watcher;
  int rc;
  int zmqevents;
  size_t len = sizeof(zmqevents);
  printf("rpc_service_poll\n");

  rc = zmq_getsockopt(service->socket, ZMQ_EVENTS, &zmqevents, &len);
  insist(rc == 0, "zmq_getsockopt(ZMQ_EVENTS) expected to return 0, "
         "but got %d", rc);

  /* Check for zmq events */
  if ((zmqevents & ZMQ_POLLIN) == 0) {
    /* No messages to receive */
    return;
  }

  /* There's an event ready to read */
  rpc_service_receive(service);
} /* rpc_service_poll */

void rpc_service_receive(rpc_service_t *service) {
  zmq_msg_t request;
  int rc;

  rc = zmq_msg_init(&request);
  rc = zmq_recv(service->socket, &request, ZMQ_NOBLOCK);
  printf("rpc_service_receive: %.*s\n", (int) zmq_msg_size(&request), (char *) zmq_msg_data(&request));

  insist_return(rc == 0 || errno == EAGAIN, (void)(0),
                "zmq_recv: expected success or EAGAIN, got errno %d:%s",
                errno, strerror(errno));

  if (rc == -1 && errno == EAGAIN) {
    /* nothing to do, would block */
    zmq_msg_close(&request);
    return;
  }

  rpc_service_handle(service, &request);
  zmq_msg_close(&request);
} /* rpc_service_receive */

void rpc_service_handle(rpc_service_t *service, zmq_msg_t *request) {
  /* Parse the msgpack */
  zmq_msg_t response;
  int rc;
  msgpack_unpacked request_msg;
  msgpack_unpacked_init(&request_msg);
  rc = msgpack_unpack_next(&request_msg, zmq_msg_data(request),
                           zmq_msg_size(request), NULL);
  insist_return(rc, (void)(0), "Failed to unpack message '%.*s'",
                (int)zmq_msg_size(request), (char *)zmq_msg_data(request));

  msgpack_object request_obj = request_msg.data;

  /* Find the method name */
  char *method = NULL;
  size_t method_len = -1;
  rc = obj_get(&request_obj, "method", MSGPACK_OBJECT_RAW, &method, &method_len);

  msgpack_sbuffer *response_buffer = msgpack_sbuffer_new();
  msgpack_sbuffer *result_buffer = msgpack_sbuffer_new();
  msgpack_sbuffer *error_buffer = msgpack_sbuffer_new();

  msgpack_packer *response_msg = msgpack_packer_new(response_buffer, msgpack_sbuffer_write);
  msgpack_packer *result = msgpack_packer_new(result_buffer, msgpack_sbuffer_write);
  msgpack_packer *error = msgpack_packer_new(error_buffer, msgpack_sbuffer_write);

  //printf("Method: %.*s\n", method_len, method);

  void *clock = zmq_stopwatch_start();
  double duration;

  if (rc != 0) { /* method not found */
    msgpack_pack_nil(result); /* result is nil on error */
    msgpack_pack_map(error, 2);
    msgpack_pack_string(error, "error", -1);
    msgpack_pack_string(error, "Message had no 'method' field", -1);
    msgpack_pack_string(error, "request", -1);
    msgpack_pack_object(error, request_obj);
  } else { /* valid method, keep going */
    //printf("The method is: '%.*s'\n", (int)method_len, method);
    rpc_name name;
    name.name = method;
    name.len = method_len;

    rpc_method *rpcmethod = g_tree_lookup(service->methods, &name);

    /* if we found a valid rpc method and the args check passed ... */
    if (rpcmethod != NULL) {
      /* the callback is responsible for filling in the 'result' and 'error' 
       * objects. */
      rpcmethod->callback(NULL, &request_obj, result, error, rpcmethod->data);
    } else {
      msgpack_pack_nil(result); /* result is nil on error */

      /* TODO(sissel): allow methods to register themselves */
      //fprintf(stderr, "Invalid request '%.*s' (unknown method): ",
              //method_len, method);
      //msgpack_object_print(stderr, request_obj);
      //fprintf(stderr, "\n");

      msgpack_pack_map(error, 2);
      msgpack_pack_string(error, "error", -1);
      msgpack_pack_string(error, "No such method requested", -1);
      msgpack_pack_string(error, "request", -1);
      msgpack_pack_object(error, request_obj);
    }
  } /* valid/invalid method handling */

  duration = zmq_stopwatch_stop(clock) / 1000000.;
  //printf("method '%.*s' took %lf seconds\n", (int)method_len, method);

  msgpack_unpacked result_unpacked;
  msgpack_unpacked error_unpacked;
  msgpack_unpacked response_unpacked;
  msgpack_unpacked_init(&result_unpacked);
  msgpack_unpacked_init(&error_unpacked);
  msgpack_unpacked_init(&response_unpacked);

  /* TODO(sissel): If this unpack test fails, we should return an error to the calling
   * client indicating that some internal error has occurred */
  //fprintf(stderr, "Result payload: '%.*s'\n", result_buffer->size,
  //result_buffer->data);
  rc = msgpack_unpack_next(&result_unpacked, result_buffer->data,
                           result_buffer->size, NULL);
  insist(rc == true, "msgpack_unpack_next failed on 'result' buffer"
         " of request '%.*s'", (int)method_len, method);
  rc = msgpack_unpack_next(&error_unpacked, error_buffer->data,
                           error_buffer->size, NULL);
  insist(rc == true, "msgpack_unpack_next failed on 'error' buffer"
         " of request '%.*s'", (int)method_len, method);

  msgpack_pack_map(response_msg, 3); /* result, error, duration */
  msgpack_pack_string(response_msg, "result", 6);
  msgpack_pack_object(response_msg, result_unpacked.data);
  msgpack_pack_string(response_msg, "error", 5);
  msgpack_pack_object(response_msg, error_unpacked.data);
  msgpack_pack_string(response_msg, "duration", 8);
  msgpack_pack_double(response_msg, duration);

  rc = msgpack_unpack_next(&response_unpacked, response_buffer->data,
                           response_buffer->size, NULL);
  insist(rc == true, "msgpack_unpack_next failed on full response buffer"
         " of request '%.*s'", (int)method_len, method);

  //printf("request: ");
  //msgpack_object_print(stdout, request_obj);
  //printf("\n");
  //printf("response: ");
  //msgpack_object_print(stdout, response_unpacked.data);
  //printf("\n");

  zmq_msg_init_data(&response, response_buffer->data, response_buffer->size,
                    free_msgpack_buffer, response_buffer);
  zmq_send(service->socket, &response, 0);
  zmq_msg_close(&response);

  msgpack_packer_free(error);
  msgpack_packer_free(result);
  msgpack_sbuffer_free(error_buffer);
  msgpack_sbuffer_free(result_buffer);
  msgpack_packer_free(response_msg);
  msgpack_unpacked_destroy(&request_msg);
} /* rpc_service_handle */

void rpc_service_register(rpc_service_t *service, const char *method_name,
                          rpc_callback *callback, void *data) {
  rpc_method *method = calloc(1, sizeof(rpc_method));
  rpc_name *name = calloc(1, sizeof(rpc_method));

  name->name = method_name;
  name->len = strlen(method_name);

  method->callback = callback;
  method->data = data;
  printf("Registering method '%.*s'\n", (int)name->len, name->name);
  g_tree_replace(service->methods, name, method);
} /* rpc_service_register */

void rpc_m_list_methods(void *context, msgpack_object *request,
                        msgpack_packer *result, msgpack_packer *error,
                        void *data) {

  //msgpack_pack_array(result, 1);
  msgpack_pack_string(result, "danced", 6);
  msgpack_pack_nil(error);
} /* rpc_m_list_methods */

void rpc_m_echo(void *context, msgpack_object *request,
                msgpack_packer *result, msgpack_packer *error, void *data) {
  int i;

  /* Hack to get the 'args' object from the msgpack and ship it back to the
   * requester */
  for (i = 0; i < request->via.map.size; i++) {
    msgpack_object *key = (msgpack_object *)&(request->via.map.ptr[i].key);
    if (strncmp("args", key->via.raw.ptr, key->via.raw.size)) {
      continue;
    }

    msgpack_object *curvalue = (msgpack_object *)&(request->via.map.ptr[i].val);
    msgpack_pack_object(result, *curvalue);
    msgpack_pack_nil(error);
    break;
  }
} /* rpc_m_echo */

int rpc_name_cmp(const void *a, const void *b) {
  const rpc_name *ma = a;
  const rpc_name *mb = b;

  if (ma->len < mb->len) {
    return strncmp(ma->name, mb->name, ma->len);
  } else {
    return strncmp(ma->name, mb->name, mb->len);
  }
} /* rpc_name_cmp */
