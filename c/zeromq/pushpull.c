/* push pull sockets don't obey HWM and will bloat memory.
 *
 * Run this program:
 * ./pushpull 10
 *
 * Runs with 10 push threads, 1 puller, you'll see memory grow endlessly.
 * Even with a HWM of 1.
 */
#define _BSD_SOURCE
#include <pthread.h>
#include <string.h>
#include <zmq.h>
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>

#define ENDPOINT "inproc://foo"

void free2(void *data, void __attribute__((unused)) *hint) {
  free(data);
}

void *pusher(void *zmq) {
  void *socket = zmq_socket(zmq, ZMQ_PUSH);
  int rc;
  int hwm = 1;
  zmq_setsockopt(socket, ZMQ_HWM, &hwm, sizeof(hwm));
  
  while (rc = zmq_connect(socket, ENDPOINT), rc != 0) {
    printf("pusher waiting for connect to succeed...\n");
    sleep(1);
  }

  for (;;) {
    zmq_msg_t msg;
    zmq_msg_init_data(&msg, strdup("Hello World"), 12, free2, NULL);
    zmq_send(socket, &msg, 0);
    zmq_msg_close(&msg);
  }
}

void *puller(void *zmq) {
  void *socket = zmq_socket(zmq, ZMQ_PULL);
  int hwm = 1;
  zmq_setsockopt(socket, ZMQ_HWM, &hwm, sizeof(hwm));
  zmq_bind(socket, ENDPOINT);

  for (;;) {
    zmq_msg_t msg;
    zmq_msg_init(&msg);
    zmq_recv(socket, &msg, 0);
    zmq_msg_close(&msg);
  }
}

int main(int argc, char **argv) {
  pthread_t p;
  void *zmq = zmq_init(0); /* inproc only, no threads needed */

  if (argc != 2) {
    printf("Usage: %s <THREADCOUNT>\n", argv[0]);
    return 1;
  }

  int i = 0;
  int threads = atoi(argv[1]);
  
  if (threads == 0) { /* assume puller */
    pthread_create(&p, NULL, puller, zmq);
    pthread_join(p, NULL);
  } else  {
    /* Create pusher threads, thread count comes from command args */
    pthread_t *pushthread;
    for (i = 0; i < threads; i++) {
      pushthread = calloc(1, sizeof(pthread_t));
      pthread_create(pushthread, NULL, pusher, zmq);
    }
    pthread_join(pushthread, NULL);
  }
  return 0;
}
