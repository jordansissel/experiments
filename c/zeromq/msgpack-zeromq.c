#include <zmq.h>
#include <msgpack.h>
#include <unistd.h>
#include <string.h>
#include <stdlib.h>
#include <assert.h>
#include <stdio.h>
#include <time.h>

#define ITERATIONS 800000000L

#define ZMQTARGET "tcp://*:3383"
//#define ZMQTARGET "inproc://foobar"

void pub(void *data) {
  void *zmq = data;
  int rc;
  char string[] = "hello world blah blah fizzledeeboop";
  void *socket = zmq_socket(zmq, ZMQ_PUB);
  rc = zmq_bind(socket, ZMQTARGET);
  printf("Pub starting\n");
  assert(rc == 0);

  /* creates buffer and serializer instance. */
  msgpack_sbuffer* buffer = msgpack_sbuffer_new();
  msgpack_packer* pk = msgpack_packer_new(buffer, msgpack_sbuffer_write);

  /* serializes ["Hello", "MessagePack"]. */
  msgpack_pack_array(pk, 2);
  msgpack_pack_raw(pk, 5);
  msgpack_pack_raw_body(pk, "Hello", 5);
  msgpack_pack_raw(pk, 11);
  msgpack_pack_raw_body(pk, "MessagePack", 11);

  int i;
  //usleep(10000000);
  for (i = 0; i < ITERATIONS; i++) {
    zmq_msg_t message;
    //printf("%zd: %.*s\n", buffer->size, buffer->size, buffer->data);
    zmq_msg_init_data(&message, buffer->data, buffer->size, NULL, NULL);
    rc = zmq_send(socket, &message, 0);
    if (rc != 0) {
      printf("error: %d\n", rc);
      perror("zmq_send");
      abort();
    }
    zmq_msg_close (&message);
    //sleep(1);
  }

  zmq_close(socket);
}

void sub(void *data) {
  void *zmq = data;

  printf("Sub starting\n");
  void *socket = zmq_socket(zmq, ZMQ_SUB);
  assert (socket);
  int rc;
  rc = zmq_connect(socket, ZMQTARGET);
  assert (rc == 0);
  zmq_setsockopt(socket, ZMQ_SUBSCRIBE, "", 0);

  struct timespec start;
  struct timespec now;
  clock_gettime(CLOCK_MONOTONIC, &start);

  int bytes = 0;
  int count = 0;
  zmq_msg_t message;

  msgpack_unpacked msg;
  int i;
  for (i = 0; i < ITERATIONS; i++) {
    zmq_msg_init (&message);
    //printf("sub: receiving\n");
    zmq_recv(socket, &message, 0);
    msgpack_unpacked_init(&msg);

    int size = zmq_msg_size(&message);
    msgpack_unpack_next(&msg, zmq_msg_data(&message), size, NULL);

    count++;
    bytes += size;

    /* Every N messages, output progress. */
    if (count % 500000 == 0) {
      msgpack_object obj = msg.data;
      msgpack_object_print(stdout, obj);
      printf("\n");

      clock_gettime(CLOCK_MONOTONIC, &now);
      if (start.tv_sec != now.tv_sec) {
        double rate = bytes / (now.tv_sec - start.tv_sec);
        printf("Duration: %ld - Rate (bytes/sec): %f\n", now.tv_sec - start.tv_sec, rate);
      }
    }
    msgpack_unpacked_destroy(&msg);
    zmq_msg_close (&message);
  }

  zmq_close(socket);
}


int main() {
  void *zmq = zmq_init(1);
  pthread_t publisher, subscriber;

  pthread_create(&publisher, NULL, pub, zmq);
  pthread_create(&subscriber, NULL, sub, zmq);

  pthread_join(publisher, NULL);
  pthread_join(subscriber, NULL);
  printf("EXITING\n");

  sleep(100);
  zmq_term(zmq);
  return 0;
}
