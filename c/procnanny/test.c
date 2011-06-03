#include <zmq.h>
#include <unistd.h>
#include <string.h>
#include <stdlib.h>
#include <assert.h>
#include <stdio.h>
#include <time.h>

typedef void* zmq_context;

void pub(void *data) {
  zmq_context zmq = data;
  int rc;
  char string[] = "hello world blah blah fizzledeeboop";
  void *socket = zmq_socket(zmq, ZMQ_PUB);
  rc = zmq_bind(socket, "inproc://data");
  assert(rc == 0);


  for (;;) {
    zmq_msg_t message;
    zmq_msg_init_size(&message, strlen(string));
    memcpy (zmq_msg_data(&message), string, strlen(string));
    rc = zmq_send (socket, &message, 0);
    assert(!rc);
    zmq_msg_close (&message);
  }
}

void sub(void *data) {
  zmq_context zmq = data;

  void *socket = zmq_socket(zmq, ZMQ_SUB);
  assert (socket);
  int rc;
  //rc = zmq_connect(socket, "inproc://data");
  rc = zmq_connect(socket, "inproc://data");
  assert (rc == 0);
  zmq_setsockopt(socket, ZMQ_SUBSCRIBE, "", 0);

  struct timespec start;
  struct timespec now;
  clock_gettime(CLOCK_MONOTONIC, &start);

  int bytes = 0;
  int count = 0;
  zmq_msg_t message;

  for (;;) {
    zmq_msg_init (&message);
    //printf("sub: receiving\n");
    zmq_recv (socket, &message, 0);
    int size = zmq_msg_size (&message);
    count++;
    bytes += size;

    if (count % 1000000 == 0) {
      clock_gettime(CLOCK_MONOTONIC, &now);
      if (start.tv_sec != now.tv_sec) {
        double rate = bytes / (now.tv_sec - start.tv_sec);
        printf("%ld - %f\n", now.tv_sec - start.tv_sec, rate);
      }
    }

    //char *string = malloc (size + 1);
    //memcpy (string, zmq_msg_data (&message), size);
    zmq_msg_close (&message);
    //string [size] = 0;
    //printf("Message: %s\n", string);
  }
}


int main() {
  zmq_context zmq = zmq_init(1);
  pthread_t publisher, subscriber;

  pthread_create(&publisher, NULL, pub, zmq);
  pthread_create(&subscriber, NULL, sub, zmq);

  pthread_join(&publisher, NULL);
  pthread_join(&subscriber, NULL);
  return 0;
}
