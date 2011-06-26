#include "insist.h"
#include "loggly_input.h"

int main(int argc, char **argv) {
  struct ev_loop *loop = EV_DEFAULT;
  loggly_input *input = loggly_input_new();
  input->port = 3333;
  input->collection = "1.2.3";
  input->name = "default";
  input->id = 1;
  input->type = INPUT_TCP;

  loggly_input_start(input, loop);
  ev_run(loop, 0);
} /* main */

