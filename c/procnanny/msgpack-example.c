#include <msgpack.h>
#include <unistd.h>
#include <string.h>
#include <stdlib.h>
#include <assert.h>
#include <stdio.h>
#include <time.h>

int main() {
  /* creates buffer and serializer instance. */
  msgpack_sbuffer* buffer = msgpack_sbuffer_new();
  msgpack_packer* pk = msgpack_packer_new(buffer, msgpack_sbuffer_write);

  /* serializes ["Hello", "MessagePack"]. */
  msgpack_pack_array(pk, 2);
  msgpack_pack_raw(pk, 5);
  msgpack_pack_raw_body(pk, "Hello", 5);
  msgpack_pack_raw(pk, 11);
  msgpack_pack_raw_body(pk, "MessagePack", 11);

  fwrite(buffer->data, buffer->size, 1, stdout);
  return 0;
}
