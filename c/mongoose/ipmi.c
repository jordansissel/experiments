#include "mongoose.h"

#define GET_CHANNEL_AUTH_CAP "\x06\x00\xff\x07" \
  "\x00\x00\x00\x00\x00\x00\x00\x00\x00\x09\x20\x18\xc8\x81\x04\x38" \
  "\x0e\x04\x31"

static void ev_handler(struct mg_connection *nc, int ev, void *ev_data) {
  switch (ev) {
    case MG_EV_CONNECT:
      printf("handler CONNECT(%d)\n", ev);
      printf("Sending %d bytes...\n", 31);
      mg_send(nc, GET_CHANNEL_AUTH_CAP, 31);
      break;
    case MG_EV_RECV:
      printf("handler RECV(%d)\n", ev);
      break;
    case MG_EV_SEND:
      printf("handler SEND(%d)\n", ev);
      break;
    case MG_EV_POLL:
      printf("handler POLL(%d)\n", ev);
      break;
    default:
      printf("handler ??? (%d)\n", ev);
      break;
  }
  (void) ev_data;
  (void) nc;
}

int main() {
  struct mg_mgr mgr;
  mg_mgr_init(&mgr, NULL);
  struct mg_connection *c;

  c = mg_connect(&mgr, "udp://pork-ipmi:623", ev_handler);

  for (;;) {  // Start infinite event loop
    mg_mgr_poll(&mgr, 1000);
  }
  mg_mgr_free(&mgr);

}
