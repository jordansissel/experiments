/*
 * This is an example of (probably improperly) using zeromq to transport
 * a string.
 */

#include <zmq.h>
#include <unistd.h>
#include <string.h>
#include <stdlib.h>
#include <assert.h>
#include <stdio.h>
#include <time.h>

#define ITERATIONS 800000000L
#define CHECKINTERVAL 2000000

//#define ZMQTARGET "tcp://*:3383"
#define ZMQTARGET "inproc://foobar"

void publisher(void *data) {
  void *zmq = data;
  int rc;

  printf("Pub starting\n");

  /* Create a 'PUB' socket, bind it to our target (see ZMQTARGET) */
  void *socket = zmq_socket(zmq, ZMQ_PUB);
  rc = zmq_bind(socket, ZMQTARGET);
  assert(rc == 0);

  char *string = "Jun  3 00:00:00 snack nagios3: CURRENT SERVICE STATE: localhost;Total Processes;OK;HARD;1;PROCS OK: 248 processes";
  size_t length = strlen(string);
  int i;

  /* Send a bunch of fabricated messages */
  for (i = 0; i < ITERATIONS; i++) {
    zmq_msg_t message;
    zmq_msg_init_data(&message, string, length, NULL, NULL);
    rc = zmq_send(socket, &message, 0);
    assert(rc == 0);
    zmq_msg_close (&message);
  }

  zmq_close(socket);
}

void subscriber(void *data) {
  void *zmq = data;
  int rc;
  struct timespec start;
  struct timespec now;
  int bytes = 0;
  int count = 0;
  int i;
  zmq_msg_t message;
  void *socket;

  printf("Sub starting\n");

  /* Create a SUBSCRIBE socket */
  socket = zmq_socket(zmq, ZMQ_SUB);
  assert (socket);

  /* Connect to our target address */
  rc = zmq_connect(socket, ZMQTARGET);
  assert (rc == 0);
  zmq_setsockopt(socket, ZMQ_SUBSCRIBE, "", 0);

  clock_gettime(CLOCK_MONOTONIC, &start);

  for (i = 0; i < ITERATIONS; i++) {
    int size;
    zmq_msg_init (&message);
    zmq_recv(socket, &message, 0);
    size = zmq_msg_size(&message);

    count++;
    bytes += size;

    /* Every N messages, output progress. */
    if (count % CHECKINTERVAL == 0) {

      clock_gettime(CLOCK_MONOTONIC, &now);
      if (start.tv_sec != now.tv_sec) {
        double rate_bytes = bytes / (now.tv_sec - start.tv_sec);
        double rate_msgs = count / (now.tv_sec - start.tv_sec);
        printf("Duration: %ld - Rate (bytes/sec): %lf / %lf\n",
               now.tv_sec - start.tv_sec, rate_bytes, rate_msgs);
      }
    }
    zmq_msg_close (&message);
  }

  zmq_close(socket);
}


int main() {
  void *zmq = zmq_init(2);
  pthread_t publisher_thread, subscriber_thread;

  pthread_create(&publisher_thread, NULL, publisher, zmq);
  pthread_create(&subscriber_thread, NULL, subscriber, zmq);

  pthread_join(publisher_thread, NULL);
  pthread_join(subscriber_thread, NULL);
  zmq_term(zmq);
  return 0;
}
