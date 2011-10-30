#include <xdo.h>

int main() {
  xdo_t *xdo = xdo_new(NULL);
  xdo_keysequence(xdo, CURRENTWINDOW, "alt+2", 10000);
  return 0;
}


