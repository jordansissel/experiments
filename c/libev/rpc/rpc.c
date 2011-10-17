#include "rpc.h"
#include <ev.h>
#include "insist.h"
#include "msgpack_helpers.h"
#include "porter.h"
#include "rpc_service.h"
#include <string.h>
#include <zmq.h>
#include <zmq_utils.h>

static void rpc_call_poll(EV_P_ ev_io *watcher, int revents);
static void rpc_call_accept_response(rpc_call_t *rpc);
static void rpc_call_free(rpc_call_t *rpc);
static void rpc_call_handle_response(rpc_call_t *rpc, zmq_msg_t *response);

rpc_call_t *rpc_call_new(void *zmq, struct ev_loop *ev, const char *address,
                         const char *method) {
  rpc_call_t *rpc = calloc(1, sizeof(rpc_call_t));
  rpc->zmq = zmq;
  rpc->ev = ev;
  rpc->address = address;

  rpc->pack_buffer = msgpack_sbuffer_new();
  rpc->request = msgpack_packer_new(rpc->pack_buffer, msgpack_sbuffer_write);

  msgpack_pack_map(rpc->request, 2); /* method and args */
  msgpack_pack_string(rpc->request, "method", 6);
  msgpack_pack_string(rpc->request, method, strlen(method));
  msgpack_pack_string(rpc->request, "args", 4);

  /* The rest of the packing is up to the invoker of the rpc call.
   * Add whatever arguments are necessary later to rpc->request */

  printf("Created new rpc call object targeting %s method %s\n",
         address, method);
  return rpc;
} /* rpc_call_new */

/* TODO(sissel): Return an error code instead of insist-aborting */
void rpc_call(rpc_call_t *rpc, rpc_response *callback, void *data) {
  int rc; /* general-purpose return code collector */

  printf("Calling rpc\n");
  
  /* Connect to the endpoint */
  insist(rpc != NULL, "rpc cannot be null");
  rpc->socket = zmq_socket(rpc->zmq, ZMQ_REQ);
  insist(rpc->socket != NULL, "zmq_socket returned NULL. zmq error(%d): %s",
         zmq_errno(), zmq_strerror(zmq_errno()));
  rc = zmq_connect(rpc->socket, rpc->address);
  insist(rc == 0, 
         "zmq_bind(\"%s\") returned %d (I expected: 0). zmq error(%d): %s",
         rpc->address, rc, zmq_errno(), zmq_strerror(zmq_errno()));

  /* TODO(sissel): Turn this 'get fd' into a method */
  int socket_fd;
  size_t len = sizeof(socket_fd);
  rc = zmq_getsockopt(rpc->socket, ZMQ_FD, &socket_fd, &len);
  insist(rc == 0, "zmq_getsockopt(ZMQ_FD) expected to return 0, but got %d",
         rc);
  printf("Socket fd: %d\n", socket_fd);

  /* Set up callback handler */
  rpc->callback = callback;
  rpc->data = data;

  /* Tell libev to call rpc_call_poll when we get a response */
  ev_io_init(&rpc->io, rpc_call_poll, socket_fd, EV_READ);
  ev_io_start(rpc->ev, &rpc->io);

  /* Now send the rpc call */
  zmq_msg_t request;
  zmq_msg_init_data(&request, rpc->pack_buffer->data, rpc->pack_buffer->size,
                    free_msgpack_buffer, rpc->pack_buffer);
  rc = zmq_send(rpc->socket, &request, 0);
  zmq_msg_close(&request);


  //while (1) {
    //sleep(5);
    //printf("Polling\n");
    //rpc_call_poll(rpc->ev, &rpc->io, 1);
  //}
} /* rpc_call */

void rpc_call_poll(EV_P_ ev_io *watcher, int revents) {
  rpc_call_t *rpc = (rpc_call_t *)watcher;
  int rc;
  int zmqevents;
  size_t len = sizeof(zmqevents);
  printf("rpc_call_poll__ %p\n", rpc->socket);

  rc = zmq_getsockopt(rpc->socket, ZMQ_EVENTS, &zmqevents, &len);
  insist(rc == 0 || rc == -1, "zmq_getsockopt(ZMQ_EVENTS) expected to return 0, "
         "but got %d", rc);
  printf("zmqevents: %d\n", zmqevents);

  /* Check for zmq events */
  if ((zmqevents & ZMQ_POLLIN) == 0) {
    /* No messages to receive */
    return;
  }

  /* There's an event ready to read */
  rpc_call_accept_response(rpc);
} /* rpc_service_poll */

void rpc_call_accept_response(rpc_call_t *rpc) {
  zmq_msg_t response;
  int rc;

  printf("rpc_call_accept_response\n");
  rc = zmq_msg_init(&response);
  rc = zmq_recv(rpc->socket, &response, ZMQ_NOBLOCK);

  insist_return(rc == 0 || errno == EAGAIN, (void)(0),
                "zmq_recv: expected success or EAGAIN, got errno %d:%s",
                errno, strerror(errno));

  if (rc == -1 && errno == EAGAIN) {
    /* nothing to do, would block */
    zmq_msg_close(&response);
    return;
  }

  rpc_call_handle_response(rpc, &response);
  zmq_msg_close(&response);

  /* Free the 'rpc' call */
  rpc_call_free(rpc);
} /* rpc_call_accept_response */

void rpc_call_handle_response(rpc_call_t *rpc, zmq_msg_t *response) {
  int rc;
  msgpack_unpacked response_msg;
  msgpack_unpacked_init(&response_msg);
  rc = msgpack_unpack_next(&response_msg, zmq_msg_data(response),
                           zmq_msg_size(response), NULL);
  insist_return(rc, (void)(0), "Failed to unpack message '%.*s'",
                (int)zmq_msg_size(response), (char *)zmq_msg_data(response));

  msgpack_object response_obj = response_msg.data;
  /* TODO(sissel): Call rpc->callback */
  printf("rpc call response: ");
  msgpack_object_print(stdout, response_obj);
  printf("\n");
} /* rpc_service_handle */

static void rpc_call_free(rpc_call_t *rpc) {
  /* TODO(sissel): Anything else need freeing? */
  free(rpc);
} /* rpc_call_free */
